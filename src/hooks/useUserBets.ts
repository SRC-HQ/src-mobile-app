import { useQuery } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { fetchUserBetSummary } from '../services/api/user-bets'

/**
 * Hook to fetch user's entry summary for current round
 * @param roundId - Current round ID
 * @param enabled - Whether to enable the query
 */
export const useUserBets = (roundId: number, enabled: boolean = true) => {
  const { account } = useMobileWallet()

  return useQuery({
    queryKey: ['user-bets', roundId, account?.address],
    queryFn: () => {
      if (!account?.address) {
        return {
          total_bet: '0',
          total_bets: 0,
          sperms: [],
        }
      }
      return fetchUserBetSummary(roundId, account.address)
    },
    enabled: enabled && !!account?.address && roundId > 0,
    refetchInterval: false, // Only refetch manually after submitting selection
    staleTime: 30000, // Consider data fresh for 30 seconds
  })
}
