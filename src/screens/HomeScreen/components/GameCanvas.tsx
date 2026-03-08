import React from 'react'
import { View } from 'react-native'
import { GameContainer } from '../../../components/game/GameContainer'

/**
 * GameCanvas - Main game display area
 * Renders the actual race game (similar to web version's canvas)
 * Shows: Preparation, Race, or Distribution scene based on phase
 * Memoized to prevent unnecessary re-renders when tabs change
 */
const GameCanvasComponent = () => {
  return (
    <View className="flex-1 bg-[#1a1840]">
      <GameContainer />
    </View>
  )
}

export const GameCanvas = React.memo(GameCanvasComponent)
GameCanvas.displayName = 'GameCanvas'
