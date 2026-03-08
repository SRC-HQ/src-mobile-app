import { ENV } from '../../config/env'

const API_BASE = ENV.API_URL

export interface UserBetSummary {
  total_bet: string
  total_bets: number
  sperms: Array<{
    sperm_id: number
    amount: string
  }>
}

/**
 * Fetch user's entry summary for a specific round
 * @param roundId - Round ID
 * @param userAddress - User's wallet address
 * @returns User entry summary
 */
export async function fetchUserBetSummary(roundId: number, userAddress: string): Promise<UserBetSummary> {
  const res = await fetch(`${API_BASE}/game/round/${roundId}/user-summary/${userAddress}`)

  if (!res.ok) {
    // Return empty summary if not found
    if (res.status === 404) {
      return {
        total_bet: '0',
        total_bets: 0,
        sperms: [],
      }
    }
    throw new Error(`Failed to fetch user entry summary: ${res.statusText}`)
  }

  return res.json()
}
