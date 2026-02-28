import Constants from 'expo-constants'

export type SolanaNetworkEnv = 'mainnet-beta' | 'mainnet' | 'devnet' | 'testnet' | 'localnet'

const RPC_URLS: Record<SolanaNetworkEnv, string> = {
  localnet: 'http://localhost:8899',
  devnet: 'https://api.devnet.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com',
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  testnet: 'https://api.testnet.solana.com',
}

// Get network from environment variable
const getNetworkFromEnv = (): SolanaNetworkEnv => {
  const network = Constants.expoConfig?.extra?.EXPO_PUBLIC_SOLANA_NETWORK
  return (network as SolanaNetworkEnv) ?? 'devnet'
}

export const SOLANA_NETWORK_ENV = getNetworkFromEnv()

export function getRpcEndpoint(): string {
  return RPC_URLS[SOLANA_NETWORK_ENV] ?? RPC_URLS.devnet
}

export function getSolscanTxUrl(txHash: string): string {
  const base = 'https://solscan.io/tx'
  const cluster =
    SOLANA_NETWORK_ENV === 'mainnet' || SOLANA_NETWORK_ENV === 'mainnet-beta' ? '' : `?cluster=${SOLANA_NETWORK_ENV}`
  return `${base}/${txHash}${cluster}`
}

export function getNetworkName(): string {
  return SOLANA_NETWORK_ENV === 'mainnet-beta'
    ? 'Mainnet'
    : SOLANA_NETWORK_ENV.charAt(0).toUpperCase() + SOLANA_NETWORK_ENV.slice(1)
}
