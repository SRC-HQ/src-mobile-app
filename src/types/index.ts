export interface WalletState {
  address: string | null
  connected: boolean
  balance: number
}

export interface User {
  walletAddress: string
  createdAt: Date
}
