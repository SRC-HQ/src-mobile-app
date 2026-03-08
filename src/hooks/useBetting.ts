import { useState, useCallback, useEffect } from 'react'
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor'
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { SpermRace } from '../contracts/types/sperm_race'
import * as IDL from '../contracts/idl/sperm_race.json'
import { ENV, getRpcUrl, getCluster } from '../config/env'

const PROGRAM_ID = new PublicKey(ENV.PROGRAM_ID)

export const useBetting = () => {
  const { account } = useMobileWallet()
  const [babyKingTotal, setBabyKingTotal] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // PDA Helpers
  const getRoundAccountPda = useCallback((roundId: number): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('round'), new BN(roundId).toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID,
    )
    return pda
  }, [])

  const getBetRecordPda = useCallback((user: PublicKey, roundId: number, spermId: number): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('bet'), user.toBuffer(), new BN(roundId).toArrayLike(Buffer, 'le', 8), Buffer.from([spermId])],
      PROGRAM_ID,
    )
    return pda
  }, [])

  const getBabyKingVaultPda = useCallback((): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from('baby_king_vault')], PROGRAM_ID)
    return pda
  }, [])

  // Fetch Baby King vault total
  useEffect(() => {
    const fetchBabyKing = async () => {
      try {
        const connection = new Connection(getRpcUrl(), 'confirmed')
        const pda = getBabyKingVaultPda()

        // Fetch account info directly
        const accountInfo = await connection.getAccountInfo(pda)

        if (!accountInfo) {
          console.warn('[useBetting] Baby King vault account not found')
          setBabyKingTotal('0')
          return
        }

        // Parse the account data
        // BabyKingVault structure: total_accumulated (u64, 8 bytes) + bump (u8, 1 byte)
        // Skip the 8-byte discriminator at the start
        const data = accountInfo.data
        if (data.length < 17) {
          console.warn('[useBetting] Invalid Baby King vault data length')
          setBabyKingTotal('0')
          return
        }

        // Read u64 total_accumulated (little-endian) starting at byte 8
        const totalAccumulatedBuffer = data.slice(8, 16)
        const totalAccumulated = new BN(totalAccumulatedBuffer, 'le')

        setBabyKingTotal(totalAccumulated.toString())
      } catch (e) {
        console.error('[useBetting] Failed to fetch baby king vault:', e)
        setBabyKingTotal(null)
      }
    }

    fetchBabyKing()
    const interval = setInterval(fetchBabyKing, 10000)
    return () => clearInterval(interval)
  }, [getBabyKingVaultPda])

  /**
   * Submit selection for selected sperms
   * @param roundId - Current round ID
   * @param selectedSperms - Set of sperm IDs to select
   * @param amountPerSperm - Amount in SOL per sperm
   * @returns Transaction signature
   */
  const placeBet = useCallback(
    async (roundId: number, selectedSperms: Set<number>, amountPerSperm: number) => {
      if (!account?.address) {
        throw new Error('Wallet not connected')
      }

      setLoading(true)
      setError(null)

      try {
        const connection = new Connection(getRpcUrl(), 'confirmed')
        const userPublicKey = new PublicKey(account.address)
        const lamports = Math.floor(amountPerSperm * LAMPORTS_PER_SOL)
        const cluster = getCluster()

        console.log('[useBetting] Submit selection config:', {
          cluster,
          network: ENV.SOLANA_NETWORK,
          rpcUrl: getRpcUrl(),
          roundId,
          selectedSperms: Array.from(selectedSperms),
          amountPerSperm,
          lamports,
        })

        // Create a dummy wallet for building instructions
        const dummyWallet = {
          publicKey: userPublicKey,
          signTransaction: async (tx: Transaction) => tx,
          signAllTransactions: async (txs: Transaction[]) => txs,
        } as any

        const provider = new AnchorProvider(connection, dummyWallet, {
          commitment: 'confirmed',
        })

        const idlWithProgramId = { ...IDL, address: PROGRAM_ID.toBase58() }
        const program = new Program<SpermRace>(idlWithProgramId as Idl, provider)

        const roundAccountPda = getRoundAccountPda(roundId)

        // Check if betting is locked on-chain
        try {
          const roundAccountInfo = await connection.getAccountInfo(roundAccountPda)

          if (!roundAccountInfo) {
            throw new Error('Round not found. Please refresh and try again.')
          }

          const data = roundAccountInfo.data

          // Parse RoundAccount manually (same structure as useRoundStatus)
          if (data.length < 148) {
            throw new Error('Invalid round data. Please refresh and try again.')
          }

          let offset = 8 // Skip discriminator
          offset += 8 // Skip round_id
          offset += 32 // Skip hashed_seed
          offset += 8 // Skip end_slot
          offset += 1 // Skip winner_id

          // Read is_locked (bool)
          const isLocked = data[offset] !== 0
          offset += 1
          offset += 8 // Skip total_pot

          // Read is_resolved (bool)
          const isResolved = data[offset] !== 0

          console.log('[useBetting] Round account state:', {
            roundId,
            isLocked,
            isResolved,
          })

          if (isLocked) {
            throw new Error('Betting is currently locked. Please wait for the next round.')
          }

          if (isResolved) {
            throw new Error('This round has already been resolved. Please wait for the next round.')
          }
        } catch (err: any) {
          if (err.message.includes('Round not found') || err.message.includes('Invalid round data')) {
            throw err
          }
          // If it's a parsing error or other error, throw it
          throw err
        }

        // Build instructions for each sperm
        const instructions: any[] = []
        for (const spermId of Array.from(selectedSperms)) {
          const betRecordPda = getBetRecordPda(userPublicKey, roundId, spermId)

          const ix = await program.methods
            .placeBet(new BN(roundId), spermId, new BN(lamports))
            .accounts({
              roundAccount: roundAccountPda,
              betRecord: betRecordPda,
              user: userPublicKey,
              systemProgram: SystemProgram.programId,
            } as any)
            .instruction()

          instructions.push(ix)
        }

        // Use Mobile Wallet Adapter to sign and send transaction
        const signature = await transact(async (wallet) => {
          // Get latest blockhash
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

          // Create transaction
          const transaction = new Transaction({
            feePayer: userPublicKey,
            blockhash,
            lastValidBlockHeight,
          })

          instructions.forEach((ix: any) => transaction.add(ix))

          // Serialize transaction for signing
          const serializedTransaction = transaction
            .serialize({
              requireAllSignatures: false,
              verifySignatures: false,
            })
            .toString('base64')

          // Authorize with correct cluster
          console.log('[useBetting] Authorizing with cluster:', cluster)

          const authResult = await wallet.authorize({
            cluster,
            identity: {
              name: 'Sperm Race',
              uri: 'https://spermrace.club',
            },
          })

          console.log('[useBetting] Authorization successful:', {
            authToken: authResult.auth_token ? 'present' : 'missing',
            accounts: authResult.accounts.length,
          })

          const signResult = await wallet.signTransactions({
            payloads: [serializedTransaction],
          })

          console.log('[useBetting] Transaction signed successfully')

          // Deserialize signed transaction
          const signedTx = Transaction.from(Buffer.from(signResult.signed_payloads[0], 'base64'))

          // Send transaction
          const txSignature = await connection.sendRawTransaction(signedTx.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          })

          // Confirm transaction
          await connection.confirmTransaction({
            signature: txSignature,
            blockhash,
            lastValidBlockHeight,
          })

          return txSignature
        })

        setLoading(false)
        return signature
      } catch (err: any) {
        console.error('[useBetting] Submit selection failed:', err)
        setError(err.message || 'Transaction failed')
        setLoading(false)
        throw err
      }
    },
    [account?.address, getRoundAccountPda, getBetRecordPda],
  )

  return {
    babyKingTotal,
    placeBet,
    loading,
    error,
  }
}
