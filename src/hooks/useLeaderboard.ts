import { useQuery } from '@tanstack/react-query'
import {
  fetchLeaderboard,
  fetchUserDetail,
  type LeaderboardEntry as APILeaderboardEntry,
} from '../services/api/leaderboard'

export interface LeaderboardEntry extends APILeaderboardEntry {
  username?: string
  image?: string
}

const fetchLeaderboardWithDetails = async (): Promise<LeaderboardEntry[]> => {
  // Fetch leaderboard entries
  const entries = await fetchLeaderboard()

  // Fetch user details for each entry
  const entriesWithDetails = await Promise.all(
    entries.map(async (entry) => {
      const userDetail = await fetchUserDetail(entry.user_address)
      return {
        ...entry,
        username: userDetail?.username ?? undefined,
        image: userDetail?.image ?? undefined,
      }
    }),
  )

  return entriesWithDetails
}

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboardWithDetails,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}
