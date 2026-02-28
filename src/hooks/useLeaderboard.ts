import { useQuery } from '@tanstack/react-query'

interface LeaderboardEntry {
  rank: number
  user_address: string
  total_winning_amount: string
  username?: string
  image?: string
}

const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  // TODO: Replace with actual API call
  // const response = await fetch('YOUR_API_ENDPOINT/leaderboard')
  // return response.json()

  // Mock data for now
  await new Promise((resolve) => setTimeout(resolve, 500))
  return []
}

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
