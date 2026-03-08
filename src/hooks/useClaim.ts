import { useState, useCallback } from 'react'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor'
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { SpermRace } from '../contracts/types/sperm_race'
import * as IDL from '../contracts/idl/sperm_race.json'
import { ENV, getRpcUrl, getCluster } from '../config/env'
import type { DistributionRecord } from '../services/api/distribution-history'

const PROGRAM_ID = new PublicKey(ENV.PROGRAM_ID)

export const useClaim = () => {
  const { account } = useMobileWallet()
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

  const getGlobalStatePda = useCallback((): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from('global_state')], PROGRAM_ID)
    return pda
  }, [])

  const getBabyKingVaultPda = useCallback((): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from('baby_king_vault')], PROGRAM_ID)
    return pda
  }, [])

  /**
   * Claim winnings for multiple records
   * @param records - Distribution records to claim
   * @returns Transaction signature
   */
  const claimWinnings = useCallback(
    async (records: DistributionRecord[]) => {
      if (!account?.address) {
        throw new Error('Wallet not connected')
      }

      if (records.length === 0) {
        throw new Error('No records to claim')
      }

      setLoading(true)
      setError(null)

      try {
        const connection = new Connection(getRpcUrl(), 'confirmed')
        const userPublicKey = new PublicKey(account.address)
        const cluster = getCluster()

        console.log('[useClaim] Claim winnings config:', {
          cluster,
          network: ENV.SOLANA_NETWORK,
          rpcUrl: getRpcUrl(),
          recordsCount: records.length,
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

        const globalStatePda = getGlobalStatePda()
        const babyKingVaultPda = getBabyKingVaultPda()

        // Fetch global state to get treasury address
        const globalStateInfo = await connection.getAccountInfo(globalStatePda)
        if (!globalStateInfo) {
          throw new Error('Global state not found')
        }

        // Parse treasury address from global state (skip 8 byte discriminator, then authority 32 bytes, then treasury 32 bytes)
        const treasuryBuffer = globalStateInfo.data.slice(40, 72)
        const treasury = new PublicKey(treasuryBuffer)

        // Build instructions for each record
        const instructions: any[] = []
        for (const record of records) {
          const roundId = parseInt(record.round_id)
          const spermId = record.winning_sperm_id
          const roundAccountPda = getRoundAccountPda(roundId)
          const betRecordPda = getBetRecordPda(userPublicKey, roundId, spermId)

          // Check if round is resolved
          try {
            const roundAccountInfo = await connection.getAccountInfo(roundAccountPda)

            if (!roundAccountInfo) {
              console.warn(`[useClaim] Round ${roundId} not found, skipping`)
              continue
            }

            const data = roundAccountInfo.data

            if (data.length < 148) {
              console.warn(`[useClaim] Invalid round ${roundId} data, skipping`)
              continue
            }

            let offset = 8 // Skip discriminator
            offset += 8 // Skip round_id
            offset += 32 // Skip hashed_seed
            offset += 8 // Skip end_slot
            offset += 1 // Skip winner_id
            offset += 1 // Skip is_locked
            offset += 8 // Skip total_pot

            // Read is_resolved (bool)
            const isResolved = data[offset] !== 0

            if (!isResolved) {
              console.warn(`[useClaim] Round ${roundId} not resolved yet, skipping`)
              continue
            }
          } catch (err: any) {
            console.warn(`[useClaim] Error checking round ${roundId}:`, err.message)
            continue
          }

          // Build claim instruction
          const ix = await program.methods
            .claimWinnings(spermId)
            .accounts({
              roundAccount: roundAccountPda,
              globalState: globalStatePda,
              babyKingVault: babyKingVaultPda,
              betRecord: betRecordPda,
              user: userPublicKey,
              treasury: treasury,
            } as any)
            .instruction()

          instructions.push(ix)
        }

        if (instructions.length === 0) {
          throw new Error('No valid claims found. All rounds may already be claimed or not resolved yet.')
        }

        console.log(`[useClaim] Built ${instructions.length} claim instructions`)

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
          console.log('[useClaim] Authorizing with cluster:', cluster)

          const authResult = await wallet.authorize({
            cluster,
            identity: {
              name: 'Sperm Race',
              uri: 'https://spermrace.club',
            },
          })

          console.log('[useClaim] Authorization successful:', {
            authToken: authResult.auth_token ? 'present' : 'missing',
            accounts: authResult.accounts.length,
          })

          const signResult = await wallet.signTransactions({
            payloads: [serializedTransaction],
          })

          console.log('[useClaim] Transaction signed successfully')

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
        console.error('[useClaim] Claim winnings failed:', err)
        setError(err.message || 'Transaction failed')
        setLoading(false)
        throw err
      }
    },
    [account?.address, getRoundAccountPda, getBetRecordPda, getGlobalStatePda, getBabyKingVaultPda],
  )

  return {
    claimWinnings,
    loading,
    error,
  }
}
