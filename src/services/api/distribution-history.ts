import { ENV } from '../../config/env'

const API_BASE = ENV.API_URL

export interface DistributionRecord {
  id: string
  round_id: string
  winning_sperm_id: number
  bet_amount: string
  winning_amount: string
  created_at: string
}

export interface DistributionHistoryResponse {
  walletAddress: string
  records: DistributionRecord[]
  totalWinningAmount: string
}

/**
 * Fetch unclaimed distribution history for a wallet address
 * @param walletAddress - User's wallet address
 * @returns Distribution history with unclaimed winnings
 */
export async function fetchUnclaimedDistributionHistory(walletAddress: string): Promise<DistributionHistoryResponse> {
  const res = await fetch(`${API_BASE}/distribution-history/unclaimed/${walletAddress}`)

  if (!res.ok) {
    // Return empty response if not found
    if (res.status === 404) {
      return {
        walletAddress,
        records: [],
        totalWinningAmount: '0',
      }
    }
    throw new Error(`Failed to fetch distribution history: ${res.statusText}`)
  }

  return res.json()
}
