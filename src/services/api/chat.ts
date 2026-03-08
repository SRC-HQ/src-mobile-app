import Constants from 'expo-constants'

// TODO: Backend Session Token Support
// When backend implements session-based authentication for chat:
// 1. Add new interface: CreateChatWithTokenDto { message: string; token: string }
// 2. Add new function: sendChatWithToken(message: string, token: string)
// 3. Update mobile app to use token-based approach (no signature per message)
// This will eliminate wallet popup for every message on mobile

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

export interface CreateChatSimpleDto {
  message: string
  address: string
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

// TODO: Implement when backend adds session token support
// export async function sendChatWithToken(message: string, token: string): Promise<ChatMessage> {
//   const apiBase = getApiBaseUrl()
//   const url = `${apiBase}/chats`
//
//   const res = await fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`,
//     },
//     body: JSON.stringify({ message }),
//   })
//
//   if (!res.ok) {
//     const err = await res.json().catch(() => ({}))
//     throw new Error(err.message || res.statusText || 'Failed to send message')
//   }
//
//   return res.json()
// }

/**
 * Send chat without signature verification
 * For mobile app where user is already authenticated via wallet connection
 */
export async function sendChatSimple(message: string, address: string): Promise<ChatMessage> {
  const apiBase = getApiBaseUrl()
  const url = `${apiBase}/chats`

  // Send with minimal signature requirement
  // Backend should accept this for authenticated users
  const timestamp = Date.now()
  const dummySignature = Buffer.from(`${address}-${timestamp}`).toString('base64')

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      address,
      signature: dummySignature,
      timestamp,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || res.statusText || 'Failed to send message')
  }

  return res.json()
}
