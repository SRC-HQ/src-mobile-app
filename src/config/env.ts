import Constants from 'expo-constants'

/**
 * Centralized Environment Configuration
 *
 * This module provides a single source of truth for all environment variables.
 * All env access should go through this module instead of direct process.env calls.
 */

export type AppEnvironment = 'development' | 'devnet' | 'mainnet'
export type SolanaNetwork = 'devnet' | 'testnet' | 'mainnet-beta' | 'localnet'

interface EnvConfig {
  APP_ENV: AppEnvironment
  SOLANA_NETWORK: SolanaNetwork
  RPC_ENDPOINT: string
  API_URL: string
  WS_URL: string
  PROGRAM_ID: string
}

/**
 * Parse and validate environment configuration
 */
function loadEnvConfig(): EnvConfig {
  // Try Expo Constants first (works in native builds)
  const extra = Constants.expoConfig?.extra

  // Fallback to process.env with explicit access (works in development)
  const appEnv = (extra?.EXPO_PUBLIC_APP_ENV || process.env.EXPO_PUBLIC_APP_ENV || 'development') as AppEnvironment

  const solanaNetwork = (extra?.EXPO_PUBLIC_SOLANA_NETWORK ||
    process.env.EXPO_PUBLIC_SOLANA_NETWORK ||
    'devnet') as SolanaNetwork

  const rpcEndpoint =
    extra?.EXPO_PUBLIC_RPC_ENDPOINT || process.env.EXPO_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com'

  const apiUrl = extra?.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'https://api.spermrace.club'

  const wsUrl = extra?.EXPO_PUBLIC_WS_URL || process.env.EXPO_PUBLIC_WS_URL || 'wss://api.spermrace.club/game'

  const programId =
    extra?.EXPO_PUBLIC_PROGRAM_ID ||
    process.env.EXPO_PUBLIC_PROGRAM_ID ||
    '2y2AdrVLKqwcA5GQEC1ULEHac3hH9ck565UBqzPaReJZ'

  return {
    APP_ENV: appEnv,
    SOLANA_NETWORK: solanaNetwork,
    RPC_ENDPOINT: rpcEndpoint,
    API_URL: apiUrl,
    WS_URL: wsUrl,
    PROGRAM_ID: programId,
  }
}

// Export singleton config instance
export const ENV = loadEnvConfig()

/**
 * Helper functions for common env checks
 */
export const isProduction = (): boolean => ENV.APP_ENV === 'mainnet'
export const isDevelopment = (): boolean => ENV.APP_ENV === 'development'
export const isDevnet = (): boolean => ENV.SOLANA_NETWORK === 'devnet'
export const isMainnet = (): boolean => ENV.SOLANA_NETWORK === 'mainnet-beta'

/**
 * Get RPC URL based on network
 */
export const getRpcUrl = (): string => {
  // Use custom RPC if provided (explicit access to avoid ESLint error)
  const extra = Constants.expoConfig?.extra
  const customRpc = extra?.EXPO_PUBLIC_SOLANA_RPC_URL || process.env.EXPO_PUBLIC_SOLANA_RPC_URL

  if (customRpc) return customRpc

  // Use configured endpoint
  return ENV.RPC_ENDPOINT
}

/**
 * Get Solana cluster name
 */
export const getCluster = (): 'devnet' | 'testnet' | 'mainnet-beta' => {
  const network = ENV.SOLANA_NETWORK

  switch (network) {
    case 'mainnet-beta':
      return 'mainnet-beta'
    case 'testnet':
      return 'testnet'
    case 'devnet':
    case 'localnet':
    default:
      return 'devnet'
  }
}

/**
 * Log current environment configuration (for debugging)
 */
export const logEnvConfig = (): void => {
  if (__DEV__) {
    console.log('🔧 Environment Configuration:', {
      APP_ENV: ENV.APP_ENV,
      SOLANA_NETWORK: ENV.SOLANA_NETWORK,
      RPC_ENDPOINT: ENV.RPC_ENDPOINT,
      API_URL: ENV.API_URL,
      WS_URL: ENV.WS_URL,
      PROGRAM_ID: ENV.PROGRAM_ID,
    })
  }
}
