/**
 * Truncate a string with ellipsis in the middle or end
 * @param str - String to truncate
 * @param maxLen - Maximum length before truncation
 * @param position - Where to place ellipsis: 'mid' or 'end'
 * @returns Truncated string
 */
export function prettyTruncate(str: string, maxLen: number, position: 'mid' | 'end' = 'end'): string {
  if (!str || str.length <= maxLen) return str

  if (position === 'mid') {
    const halfLen = Math.floor((maxLen - 3) / 2)
    return `${str.slice(0, halfLen)}...${str.slice(-halfLen)}`
  }

  return `${str.slice(0, maxLen - 3)}...`
}

/**
 * Format timestamp to relative time (e.g., "5m ago", "2h ago")
 * @param iso - ISO timestamp string
 * @returns Formatted relative time string
 */
export function formatTimeAgo(iso: string): string {
  const date = new Date(iso)
  const now = Date.now()
  const diffMs = now - date.getTime()

  if (!Number.isFinite(diffMs)) return ''

  const diffSec = Math.max(0, Math.floor(diffMs / 1000))
  if (diffSec < 60) return `${diffSec}s ago`

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

/**
 * Format SOL amount with smart decimal places
 * - Uses 2 decimals for amounts >= 1
 * - Uses 4 decimals for amounts < 1
 * - Removes trailing zeros
 * @param amount - Amount in SOL
 * @returns Formatted string
 */
export function formatSolAmount(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount

  if (!Number.isFinite(num)) return '0'

  // Use 2 decimals for amounts >= 1, 4 decimals for smaller amounts
  const decimals = num >= 1 ? 2 : 4
  const formatted = num.toFixed(decimals)

  // Remove trailing zeros and decimal point if not needed
  return formatted.replace(/\.?0+$/, '')
}
