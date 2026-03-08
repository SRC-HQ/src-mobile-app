import { useEffect, useRef, useState } from 'react'
import { GameSocketService } from '../services/GameSocketService'
import { useGameStore } from '../../stores/gameStore'

// Get WebSocket URL from environment
const getSocketUrl = () => {
  console.log('🔍 [ENV DEBUG] All env vars:', {
    WS_URL: process.env.EXPO_PUBLIC_WS_URL,
    API_URL: process.env.EXPO_PUBLIC_API_URL,
    NETWORK: process.env.EXPO_PUBLIC_SOLANA_NETWORK,
  })

  // Use WS_URL if available, otherwise derive from API_URL
  const wsUrl = process.env.EXPO_PUBLIC_WS_URL
  if (wsUrl) {
    console.log('✅ Using WS_URL from env:', wsUrl)
    return wsUrl
  }

  // Fallback: derive from API_URL
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'
  const derivedUrl = `${apiUrl.replace(/^http/, 'ws')}/game`
  console.warn('⚠️ WS_URL not found! Derived from API_URL:', derivedUrl)
  return derivedUrl
}

export const useGameSocket = () => {
  const socketServiceRef = useRef<GameSocketService | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { setConnected, setGameState, updatePool, updatePhase, setRoundResult } = useGameStore()

  useEffect(() => {
    const socketUrl = getSocketUrl()
    console.log('Initializing game socket with URL:', socketUrl)

    const socketService = new GameSocketService(socketUrl)
    socketServiceRef.current = socketService

    socketService.connect(
      // onGameState
      (data) => {
        setGameState(data)
      },
      // onPoolUpdate
      (data) => {
        updatePool(data)
      },
      // onPhaseUpdate
      (data) => {
        updatePhase(data)
      },
      // onRoundResult
      (data) => {
        setRoundResult(data)
      },
      // onConnect
      () => {
        setConnected(true)
        setError(null)
      },
      // onDisconnect
      () => {
        setConnected(false)
      },
      // onError
      (err) => {
        console.error('WebSocket error:', err)
        setError(err.message || 'Connection error')
      },
    )

    return () => {
      socketService.disconnect()
      setConnected(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    isConnected: socketServiceRef.current?.isConnected() ?? false,
    error,
  }
}
