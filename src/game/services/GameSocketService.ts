import { io, Socket } from 'socket.io-client'
import { GameStatePayload, PoolUpdatePayload, PhaseUpdatePayload, RoundResultPayload } from '../types/GameState'

interface ServerToClientEvents {
  'game:state': (data: GameStatePayload) => void
  'pool:update': (data: PoolUpdatePayload) => void
  'phase:update': (data: PhaseUpdatePayload) => void
  'round:result': (data: RoundResultPayload) => void
  error: (data: { code: string; message: string }) => void
}

interface ClientToServerEvents extends Record<string, never> {
  // Add client events if needed
}

interface SocketError extends Error {
  type?: string
  description?: string
}

export class GameSocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000

  constructor(private url: string) {}

  connect(
    onGameState: (data: GameStatePayload) => void,
    onPoolUpdate: (data: PoolUpdatePayload) => void,
    onPhaseUpdate: (data: PhaseUpdatePayload) => void,
    onRoundResult: (data: RoundResultPayload) => void,
    onConnect: () => void,
    onDisconnect: () => void,
    onError: (error: any) => void,
  ) {
    if (this.socket?.connected) {
      console.log('[GameSocket] Already connected')
      return
    }

    console.log('[GameSocket] Connecting to:', this.url)

    this.socket = io(this.url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 10000,
      // Add these for better compatibility
      upgrade: false,
      rememberUpgrade: false,
      forceNew: true,
    })

    // Connection events
    this.socket.on('connect', () => {
      console.log('[GameSocket] ✅ Connected successfully')
      this.reconnectAttempts = 0
      onConnect()
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[GameSocket] ❌ Disconnected:', reason)
      onDisconnect()
    })

    this.socket.on('connect_error', (error: SocketError) => {
      console.error('[GameSocket] ❌ Connection error:', error.message)
      console.error('[GameSocket] Error details:', {
        message: error.message,
        type: error.type,
        description: error.description,
      })
      this.reconnectAttempts++

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[GameSocket] Max reconnection attempts reached')
      }

      onError(error)
    })

    this.socket.io.on('reconnect_attempt', (attempt: number) => {
      console.log(`[GameSocket] 🔄 Reconnection attempt ${attempt}/${this.maxReconnectAttempts}`)
    })

    this.socket.io.on('reconnect_failed', () => {
      console.error('[GameSocket] ❌ Reconnection failed')
      onError(new Error('Reconnection failed'))
    })

    // Game events
    this.socket.on('game:state', (data) => {
      console.log('[GameSocket] 📦 Received game state:', {
        phase: data.phase,
        roundId: data.roundId,
        hasRaceParams: !!data.raceParams,
        raceParamsCount: data.raceParams?.length || 0,
        hasLeaderboard: !!data.leaderboard,
      })
      onGameState(data)
    })

    this.socket.on('pool:update', (data) => {
      console.log('[GameSocket] 💰 Received pool update:', {
        spermId: data.spermId,
        totalBets: data.totalBets,
        bettorCount: data.bettorCount,
      })
      onPoolUpdate(data)
    })

    this.socket.on('phase:update', (data) => {
      console.log('[GameSocket] 🔄 Received phase update:', {
        phase: data.phase,
        roundId: data.roundId,
        hasRaceParams: !!data.raceParams,
        raceParamsCount: data.raceParams?.length || 0,
        hasLeaderboard: !!data.leaderboard,
      })
      onPhaseUpdate(data)
    })

    this.socket.on('round:result', (data) => {
      console.log('[GameSocket] 🏁 Received round result:', {
        winnerId: data.winnerId,
        totalPot: data.totalPot,
        hasRaceParams: !!data.raceParams,
        hasLeaderboard: !!data.leaderboard,
      })
      onRoundResult(data)
    })

    this.socket.on('error', (data) => {
      console.error('[GameSocket] ❌ Socket error:', data)
      onError(data)
    })
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting game socket')
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket
  }
}
