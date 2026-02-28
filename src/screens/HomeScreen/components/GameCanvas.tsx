import React from 'react'
import { View, Text } from 'react-native'

export const GameCanvas = () => {
  return (
    <View className="flex-1 bg-black items-center justify-center">
      <View className="bg-[#6b6b8f]/80 p-8 items-center">
        <Text style={{ fontFamily: 'Orbitron_900Black' }} className="text-white text-2xl uppercase tracking-wider mb-4">
          PREPARATION PHASE — CHOOSE YOUR SPERM
        </Text>
        <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/60 text-sm">
          Game canvas will be rendered here
        </Text>
      </View>
    </View>
  )
}
