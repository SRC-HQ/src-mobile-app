import { useState, useEffect, useCallback } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { ENV, getRpcUrl } from '../config/env'

const PROGRAM_ID = new PublicKey(ENV.PROGRAM_ID)

export interface RoundStatus {
  roundId: number
  isLocked: boolean
  isResolved: boolean
  totalPot: string
  endSlot: string
  winnerId: number
  babyKingHit: boolean
}

export const useRoundStatus = (roundId: number) => {
  const [status, setStatus] = useState<RoundStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getRoundAccountPda = useCallback((roundId: number): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('round'), new BN(roundId).toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID,
    )
    return pda
  }, [])

  const fetchRoundStatus = useCallback(async () => {
    if (roundId === 0) return

    setLoading(true)
    setError(null)

    try {
      const connection = new Connection(getRpcUrl(), 'confirmed')
      const roundAccountPda = getRoundAccountPda(roundId)

      // Fetch account info directly and parse manually
      const accountInfo = await connection.getAccountInfo(roundAccountPda)

      if (!accountInfo) {
        console.warn('[useRoundStatus] Round account not found')
        setError('Round not found')
        setLoading(false)
        return
      }

      const data = accountInfo.data

      // RoundAccount structure (after 8-byte discriminator):
      // round_id: u64 (8 bytes)
      // hashed_seed: [u8; 32] (32 bytes)
      // end_slot: u64 (8 bytes)
      // winner_id: u8 (1 byte)
      // is_locked: bool (1 byte)
      // total_pot: u64 (8 bytes)
      // is_resolved: bool (1 byte)
      // bets_per_sperm: [u64; 10] (80 bytes)
      // baby_king_hit: bool (1 byte)
      // baby_king_jackpot_snapshot: u64 (8 bytes)

      if (data.length < 148) {
        console.warn('[useRoundStatus] Invalid round account data length:', data.length)
        setError('Invalid round data')
        setLoading(false)
        return
      }

      let offset = 8 // Skip discriminator

      // Read round_id (u64)
      const roundIdBuffer = data.slice(offset, offset + 8)
      const roundIdValue = new BN(roundIdBuffer, 'le')
      offset += 8

      // Skip hashed_seed (32 bytes)
      offset += 32

      // Read end_slot (u64)
      const endSlotBuffer = data.slice(offset, offset + 8)
      const endSlotValue = new BN(endSlotBuffer, 'le')
      offset += 8

      // Read winner_id (u8)
      const winnerIdValue = data[offset]
      offset += 1

      // Read is_locked (bool)
      const isLockedValue = data[offset] !== 0
      offset += 1

      // Read total_pot (u64)
      const totalPotBuffer = data.slice(offset, offset + 8)
      const totalPotValue = new BN(totalPotBuffer, 'le')
      offset += 8

      // Read is_resolved (bool)
      const isResolvedValue = data[offset] !== 0
      offset += 1

      // Skip bets_per_sperm (80 bytes)
      offset += 80

      // Read baby_king_hit (bool)
      const babyKingHitValue = data[offset] !== 0

      console.log('[useRoundStatus] Round status:', {
        roundId: roundIdValue.toString(),
        isLocked: isLockedValue,
        isResolved: isResolvedValue,
        totalPot: totalPotValue.toString(),
      })

      setStatus({
        roundId: roundIdValue.toNumber(),
        isLocked: isLockedValue,
        isResolved: isResolvedValue,
        totalPot: totalPotValue.toString(),
        endSlot: endSlotValue.toString(),
        winnerId: winnerIdValue,
        babyKingHit: babyKingHitValue,
      })
    } catch (err: any) {
      console.error('[useRoundStatus] Failed to fetch round status:', err)
      setError(err.message || 'Failed to fetch round status')
    } finally {
      setLoading(false)
    }
  }, [roundId, getRoundAccountPda])

  useEffect(() => {
    fetchRoundStatus()
    // Poll every 5 seconds
    const interval = setInterval(fetchRoundStatus, 5000)
    return () => clearInterval(interval)
  }, [fetchRoundStatus])

  return {
    status,
    loading,
    error,
    refetch: fetchRoundStatus,
  }
}
