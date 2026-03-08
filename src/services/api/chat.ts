import Constants from 'expo-constants'

export interface ChatMessage {
  id: string
  user_address: string
  message: string
  created_at: string
}

export interface CreateChatDto {
  message: string
  address: string
  signature: string
  timestamp: number
}

export interface CreateChatWithAuthDto {
  message: string
  address: string
  authSignature: string
  authTimestamp: number
}

const getApiBaseUrl = (): string => {
  return Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 'https://api.spermrace.club'
}

export async function fetchChats(skip = 0, limit = 100): Promise<ChatMessage[]> {
  const apiBase = getApiBaseUrl()
  const url = `${apiBase}/chats?skip=${skip}&limit=${limit}`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch chats')
  }
  const json = await res.json()
  return json.data ?? []
}

export async function sendChat(dto: CreateChatDto): Promise<ChatMessage> {
  const apiBase = getApiBaseUrl()
  const url = `${apiBase}/chats`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || res.statusText || 'Failed to send message')
  }

  return res.json()
}

/**
 * Send chat using authentication session (signed once during wallet connection)
 * This eliminates the need to sign every message
 *
 * Note: Backend currently validates signature with message content.
 * For now, we'll use the old approach but keep the auth session for future use.
 */
export async function sendChatWithAuth(dto: CreateChatWithAuthDto): Promise<ChatMessage> {
  const apiBase = getApiBaseUrl()
  const url = `${apiBase}/chats`

  // Backend expects signature to be signed with message content
  // For now, we send the auth signature but backend needs to be updated
  // to accept authentication-based signatures instead of per-message signatures
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: dto.message,
      address: dto.address,
      signature: dto.authSignature,
      timestamp: dto.authTimestamp,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || res.statusText || 'Failed to send message')
  }

  return res.json()
}

/**
 * Send chat with per-message signature
 * This is the current backend implementation that validates signature with message content
 */
export async function sendChatWithSignature(
  message: string,
  address: string,
  signature: string,
  timestamp: number,
): Promise<ChatMessage> {
  const apiBase = getApiBaseUrl()
  const url = `${apiBase}/chats`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      address,
      signature,
      timestamp,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || res.statusText || 'Failed to send message')
  }

  return res.json()
}
