import { useQuery } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { fetchUnclaimedDistributionHistory } from '../services/api/distribution-history'

/**
 * Hook to fetch unclaimed distribution history for the connected wallet
 */
export const useDistributionHistory = () => {
  const { account } = useMobileWallet()

  return useQuery({
    queryKey: ['distribution-history', account?.address],
    queryFn: () => {
      if (!account?.address) {
        return {
          walletAddress: '',
          records: [],
          totalWinningAmount: '0',
        }
      }
      return fetchUnclaimedDistributionHistory(account.address)
    },
    enabled: !!account?.address,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}
