// Wallet service menggunakan @wallet-ui/react-native-kit
// Semua wallet operations dilakukan melalui useMobileWallet hook di components

export const WalletService = {
  // Helper functions jika diperlukan di masa depan

  formatAddress: (address: string, chars = 4): string => {
    if (!address) return ''
    return `${address.slice(0, chars)}...${address.slice(-chars)}`
  },

  formatBalance: (balance: number, decimals = 2): string => {
    return balance.toFixed(decimals)
  },
}

export const walletService = WalletService
