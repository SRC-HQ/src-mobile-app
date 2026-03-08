import { storageService } from './storage'

const AUTH_TOKEN_KEY = '@sperm-race/auth-token'
const AUTH_ADDRESS_KEY = '@sperm-race/auth-address'
const AUTH_SIGNATURE_KEY = '@sperm-race/auth-signature'
const AUTH_TIMESTAMP_KEY = '@sperm-race/auth-timestamp'

export interface AuthSession {
  address: string
  signature: string
  timestamp: number
}

export const authService = {
  /**
   * Save authentication session after successful wallet signature
   */
  async saveAuthSession(session: AuthSession): Promise<void> {
    await storageService.setItem(AUTH_ADDRESS_KEY, session.address)
    await storageService.setItem(AUTH_SIGNATURE_KEY, session.signature)
    await storageService.setItem(AUTH_TIMESTAMP_KEY, session.timestamp.toString())
  },

  /**
   * Get saved authentication session
   */
  async getAuthSession(): Promise<AuthSession | null> {
    const address = await storageService.getItem(AUTH_ADDRESS_KEY)
    const signature = await storageService.getItem(AUTH_SIGNATURE_KEY)
    const timestamp = await storageService.getItem(AUTH_TIMESTAMP_KEY)

    if (!address || !signature || !timestamp) return null

    return {
      address,
      signature,
      timestamp: parseInt(timestamp, 10),
    }
  },

  /**
   * Check if authentication session is still valid (24 hours)
   */
  async isSessionValid(): Promise<boolean> {
    const session = await this.getAuthSession()
    if (!session) return false

    const now = Date.now()
    const age = now - session.timestamp
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    return age < maxAge
  },

  /**
   * Clear authentication data
   */
  async clearAuth(): Promise<void> {
    await storageService.removeItem(AUTH_TOKEN_KEY)
    await storageService.removeItem(AUTH_ADDRESS_KEY)
    await storageService.removeItem(AUTH_SIGNATURE_KEY)
    await storageService.removeItem(AUTH_TIMESTAMP_KEY)
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await this.isSessionValid()
  },
}
