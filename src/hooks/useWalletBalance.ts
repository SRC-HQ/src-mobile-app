import { useCallback } from 'react'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useQuery, useQueryClient } from '@tanstack/react-query'

const getRpcUrl = (): string => {
  const network = process.env.EXPO_PUBLIC_SOLANA_NETWORK || 'devnet'
  const customRpc = process.env.EXPO_PUBLIC_SOLANA_RPC_URL

  if (customRpc) {
    return customRpc
  }

  switch (network) {
    case 'mainnet-beta':
      return 'https://api.mainnet-beta.solana.com'
    case 'devnet':
      return 'https://api.devnet.solana.com'
    case 'testnet':
      return 'https://api.testnet.solana.com'
    default:
      return 'https://api.devnet.solana.com'
  }
}

const fetchBalance = async (address: string): Promise<number> => {
  const connection = new Connection(getRpcUrl(), 'confirmed')
  const publicKey = new PublicKey(address)
  const lamports = await connection.getBalance(publicKey)
  return lamports
}

export const useWalletBalance = () => {
  const { account } = useMobileWallet()
  const queryClient = useQueryClient()

  const {
    data: balance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['wallet-balance', account?.address],
    queryFn: () => {
      if (!account?.address) {
        return null
      }
      return fetchBalance(account.address)
    },
    enabled: !!account?.address,
    staleTime: 10000, // Consider data fresh for 10 seconds
    refetchInterval: 30000, // Auto-refetch every 30 seconds
  })

  const refetch = useCallback(() => {
    if (account?.address) {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance', account.address] })
    }
  }, [account?.address, queryClient])

  return {
    balance,
    balanceInSol: balance !== null && balance !== undefined ? balance / LAMPORTS_PER_SOL : null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  }
}
