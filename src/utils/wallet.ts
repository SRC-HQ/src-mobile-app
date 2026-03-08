/**
 * Wallet utility functions for Solana Mobile Wallet Adapter
 */

const MESSAGE_PREFIX = 'sperm-race-chat'

/**
 * Create the message to be signed for chat authentication
 * @param address - User's wallet address
 * @param message - Chat message content
 * @param timestamp - Timestamp in milliseconds
 * @returns Message string to be signed
 */
export function createChatSignMessage(address: string, message: string, timestamp: number): string {
  return `${MESSAGE_PREFIX}\n${address}\n${message}\n${timestamp}`
}

/**
 * Convert Uint8Array signature to base64 string
 * @param signature - Signature as Uint8Array
 * @returns Base64-encoded signature
 */
export function signatureToBase64(signature: Uint8Array): string {
  return Buffer.from(signature).toString('base64')
}
