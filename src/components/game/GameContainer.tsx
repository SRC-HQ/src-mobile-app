import React, { useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useGameSocket } from '../../game/hooks/useGameSocket'
import { useGameStore } from '../../stores/gameStore'
import { PreparationScene } from './PreparationScene'
import { RaceScene } from './RaceScene'
import { DistributionScene } from './DistributionScene'
import { ENV } from '../../config/env'

const GameContainerComponent: React.FC = () => {
  const { error } = useGameSocket()
  const { phase, isConnected, isStateSynced } = useGameStore()

  // Log environment for debugging
  useEffect(() => {
    console.log('[GameContainer] Environment:', {
      API_URL: ENV.API_URL,
      WS_URL: ENV.WS_URL,
      NETWORK: ENV.SOLANA_NETWORK,
    })
  }, [])

  // Log current phase for debugging
  useEffect(() => {
    console.log('[GameContainer] Current phase:', phase)
  }, [phase])

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Connection Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Text style={styles.errorHint}>
          Check your internet connection{'\n'}
          or try again later
        </Text>
      </View>
    )
  }

  if (!isConnected || !isStateSynced) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#33ff57" />
        <Text style={styles.loadingText}>
          {!isConnected ? 'Connecting to game server...' : 'Loading game state...'}
        </Text>
        <Text style={styles.loadingHint}>{ENV.WS_URL || 'Connecting...'}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {phase === 'PREPARATION' && <PreparationScene />}
      {phase === 'RACE' && <RaceScene />}
      {phase === 'DISTRIBUTION' && <DistributionScene />}

      {/* Fallback if phase is not recognized */}
      {!['PREPARATION', 'RACE', 'DISTRIBUTION'].includes(phase) && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Unknown phase: {phase}</Text>
        </View>
      )}
    </View>
  )
}

export const GameContainer = React.memo(GameContainerComponent)
GameContainer.displayName = 'GameContainer'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2850',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2850',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  loadingHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#ffffff60',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2850',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff5733',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorHint: {
    fontSize: 12,
    color: '#ffffff60',
    textAlign: 'center',
    lineHeight: 18,
  },
})
