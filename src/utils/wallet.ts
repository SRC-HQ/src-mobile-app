/**
 * Wallet utility functions for Solana Mobile Wallet Adapter
 */

const AUTH_MESSAGE_PREFIX = 'sperm-race-auth'
const CHAT_MESSAGE_PREFIX = 'sperm-race-chat'

/**
 * Create the message to be signed for wallet authentication
 * This is signed once during wallet connection
 * @param address - User's wallet address
 * @param timestamp - Timestamp in milliseconds
 * @returns Message string to be signed
 */
export function createAuthSignMessage(address: string, timestamp: number): string {
  return `${AUTH_MESSAGE_PREFIX}\nAddress: ${address}\nTimestamp: ${timestamp}\n\nSign this message to authenticate with Sperm Race Club.`
}

/**
 * Create the message to be signed for chat message
 * This is signed for each message (required by current backend)
 * @param address - User's wallet address
 * @param message - Chat message content
 * @param timestamp - Timestamp in milliseconds
 * @returns Message string to be signed
 */
export function createChatSignMessage(address: string, message: string, timestamp: number): string {
  return `${CHAT_MESSAGE_PREFIX}\n${address}\n${message}\n${timestamp}`
}

/**
 * Convert Uint8Array signature to base64 string
 * @param signature - Signature as Uint8Array
 * @returns Base64-encoded signature
 */
export function signatureToBase64(signature: Uint8Array): string {
  return Buffer.from(signature).toString('base64')
}
