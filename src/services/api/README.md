# API Services

This directory contains API client functions for communicating with the backend services.

## Round History API

### `round-history.ts`

Provides functions to fetch game round history data from the backend.

#### Types

- `WinnerRound`: Interface representing a winner round data from the API

#### Functions

- `fetchWinnerRounds(skip?: number)`: Fetches winner rounds from the API
  - `skip`: Optional parameter for pagination (number of records to skip)
  - Returns: `Promise<WinnerRound[]>`

#### Configuration

The API base URL is configured via environment variable:

- `EXPO_PUBLIC_API_URL`: Base URL for the API (defaults to `https://api.spermrace.club`)

#### Usage Example

```typescript
import { fetchWinnerRounds } from '@/services/api/round-history'

// Fetch first page
const rounds = await fetchWinnerRounds()

// Fetch with pagination
const moreRounds = await fetchWinnerRounds(20)
```

## Chat API

### `chat.ts`

Provides functions to fetch and send chat messages.

#### Types

- `ChatMessage`: Interface representing a chat message
  - `id`: Unique message ID
  - `user_address`: Solana wallet address of the sender
  - `message`: Message content (max 500 characters)
  - `created_at`: ISO timestamp when message was created

- `CreateChatDto`: Data transfer object for creating a new chat message
  - `message`: Message content
  - `address`: Sender's wallet address
  - `signature`: Base64-encoded signature from wallet
  - `timestamp`: Timestamp in milliseconds (for replay protection)

#### Functions

- `fetchChats(skip?: number, limit?: number)`: Fetches chat messages from the API
  - `skip`: Number of messages to skip (for pagination)
  - `limit`: Maximum number of messages to fetch (default: 100, max: 100)
  - Returns: `Promise<ChatMessage[]>`

- `sendChat(dto: CreateChatDto)`: Sends a new chat message
  - `dto`: Message data with signature
  - Returns: `Promise<ChatMessage>`

#### Security

All chat messages must be signed with the user's Solana wallet to prevent impersonation. The signature is verified on the backend using the following format:

```
sperm-race-chat
{address}
{message}
{timestamp}
```

The timestamp is used for replay protection (messages older than 5 minutes are rejected).

#### Usage Example

```typescript
import { fetchChats, sendChat } from '@/services/api/chat'
import { signChatMessage } from '@/utils/wallet'

// Fetch messages
const messages = await fetchChats(0, 100)

// Send a message
const address = 'YOUR_WALLET_ADDRESS'
const message = 'Hello, world!'
const timestamp = Date.now()
const signature = await signChatMessage(address, message, timestamp)

const newMessage = await sendChat({
  message,
  address,
  signature,
  timestamp,
})
```
