export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return ''
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export const formatBalance = (balance: number, decimals = 2): string => {
  return balance.toFixed(decimals)
}

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
