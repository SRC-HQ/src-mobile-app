import Constants from 'expo-constants'

export interface LeaderboardEntry {
  rank: number
  user_address: string
  total_winning_amount: string
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
}

export interface UserDetail {
  id: string
  user_address: string
  username: string | null
  image: string | null
  x_id?: string | null
  x_username: string | null
  created_at: string
  updated_at: string
}

const getApiBaseUrl = (): string => {
  return Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 'https://api.spermrace.club'
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const apiBase = getApiBaseUrl()
  const url = `${apiBase}/distribution-history/leaderboard`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch leaderboard')
  }
  const data: LeaderboardResponse = await res.json()
  return data.entries ?? []
}

export async function fetchUserDetail(userAddress: string): Promise<UserDetail | null> {
  if (!userAddress) return null

  const apiBase = getApiBaseUrl()
  const url = `${apiBase}/users/${userAddress}`

  const res = await fetch(url)
  if (!res.ok) {
    return null
  }
  const data: UserDetail = await res.json()
  return data
}
