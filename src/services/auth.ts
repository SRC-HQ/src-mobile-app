import { storageService } from './storage'

const AUTH_TOKEN_KEY = '@sperm-race/auth-token'
const AUTH_ADDRESS_KEY = '@sperm-race/auth-address'

export const authService = {
  /**
   * Save authentication token after successful wallet connection
   */
  async saveAuthToken(token: string, address: string): Promise<void> {
    await storageService.setItem(AUTH_TOKEN_KEY, token)
    await storageService.setItem(AUTH_ADDRESS_KEY, address)
  },

  /**
   * Get saved authentication token
   */
  async getAuthToken(): Promise<string | null> {
    return await storageService.getItem(AUTH_TOKEN_KEY)
  },

  /**
   * Get saved wallet address
   */
  async getAuthAddress(): Promise<string | null> {
    return await storageService.getItem(AUTH_ADDRESS_KEY)
  },

  /**
   * Clear authentication data
   */
  async clearAuth(): Promise<void> {
    await storageService.removeItem(AUTH_TOKEN_KEY)
    await storageService.removeItem(AUTH_ADDRESS_KEY)
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken()
    return !!token
  },
}
