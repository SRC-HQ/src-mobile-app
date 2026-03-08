import { storageService } from './storage'

const CHAT_SESSION_KEY = '@sperm-race/chat-session'

export interface ChatSession {
  address: string
  signature: string
  timestamp: number
  message: string // The message that was signed
}

export const chatSessionService = {
  /**
   * Save chat session after first successful signature
   */
  async saveSession(session: ChatSession): Promise<void> {
    await storageService.setItem(CHAT_SESSION_KEY, JSON.stringify(session))
  },

  /**
   * Get saved chat session
   */
  async getSession(): Promise<ChatSession | null> {
    const data = await storageService.getItem(CHAT_SESSION_KEY)
    if (!data) return null
    try {
      return JSON.parse(data)
    } catch {
      return null
    }
  },

  /**
   * Check if session is still valid (within 4 minutes)
   */
  async isSessionValid(): Promise<boolean> {
    const session = await this.getSession()
    if (!session) return false

    const now = Date.now()
    const age = now - session.timestamp
    const maxAge = 4 * 60 * 1000 // 4 minutes

    return age < maxAge
  },

  /**
   * Clear chat session
   */
  async clearSession(): Promise<void> {
    await storageService.removeItem(CHAT_SESSION_KEY)
  },
}
