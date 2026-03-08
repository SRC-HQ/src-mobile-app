import { useQuery } from '@tanstack/react-query'
import { fetchWinnerRounds, type WinnerRound } from '../services/api/round-history'
import { prettyTruncate, formatTimeAgo, formatSolAmount } from '../utils/format'

export interface HistoryRow {
  id: string
  race: string
  block: string
  txHash: string
  winnerIndex: number
  winnersCount: number
  totalPool: string
  babyKing: string
  time: string
}

const LAMPORTS_PER_SOL = 1_000_000_000

const mapWinnerToHistoryRow = (item: WinnerRound): HistoryRow => {
  const id = item.round_id
  const race = `#${item.round_id}`
  const block = prettyTruncate(item.tx_hash, 10, 'mid')
  const txHash = item.tx_hash
  const winnerIndex = typeof item.winner_sperm_id === 'number' ? item.winner_sperm_id : 0
  const winnersCount = typeof item.total_user === 'number' ? item.total_user : 0
  const totalPoolLamports = Number(item.total_pot || '0')
  const totalPool = Number.isFinite(totalPoolLamports) ? formatSolAmount(totalPoolLamports / LAMPORTS_PER_SOL) : '0'
  const babyKing = item.is_baby_king_hit === true ? 'Hit' : item.is_baby_king_hit === false ? 'Miss' : '—'
  const time = formatTimeAgo(item.timestamp)

  return {
    id,
    race,
    block,
    txHash,
    winnerIndex,
    winnersCount,
    totalPool,
    babyKing,
    time,
  }
}

const fetchGameHistory = async (): Promise<HistoryRow[]> => {
  const winners = await fetchWinnerRounds()
  return winners.map(mapWinnerToHistoryRow)
}

export const useGameHistory = () => {
  return useQuery({
    queryKey: ['gameHistory'],
    queryFn: fetchGameHistory,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}

// Export function for manual pagination
export const fetchGameHistoryPage = async (skip: number): Promise<HistoryRow[]> => {
  const winners = await fetchWinnerRounds(skip)
  return winners.map(mapWinnerToHistoryRow)
}
