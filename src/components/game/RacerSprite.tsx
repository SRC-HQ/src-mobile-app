import React, { useEffect } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated'
import { ASSETS, RACE_CONFIG } from '../../game/constants'

interface RacerSpriteProps {
  racerId: number
  progress: number // 0 to 1
  laneIndex: number
  isFinished: boolean
}

export const RacerSprite: React.FC<RacerSpriteProps> = ({ racerId, progress, laneIndex, isFinished }) => {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const scale = useSharedValue(1)

  // Animate horizontal position based on progress
  useEffect(() => {
    const startX = RACE_CONFIG.START_X
    const finishX = RACE_CONFIG.FINISH_X
    const targetX = startX + (finishX - startX) * progress

    translateX.value = withTiming(targetX, {
      duration: 100,
    })
  }, [progress])

  // Animate vertical bobbing (swimming motion)
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(withTiming(-3, { duration: 200 }), withTiming(3, { duration: 200 })),
      -1,
      true,
    )
  }, [])

  // Scale animation when finished
  useEffect(() => {
    if (isFinished) {
      scale.value = withSequence(withTiming(1.3, { duration: 200 }), withTiming(1, { duration: 200 }))
    }
  }, [isFinished])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }))

  const yPosition = RACE_CONFIG.START_Y + laneIndex * RACE_CONFIG.LANE_HEIGHT

  return (
    <Animated.View
      style={[
        styles.racer,
        {
          top: yPosition,
          left: 0,
        },
        animatedStyle,
      ]}
    >
      <Image source={ASSETS.RACERS[racerId]} style={styles.racerImage} resizeMode="contain" />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  racer: {
    position: 'absolute',
    width: RACE_CONFIG.RACER_SIZE,
    height: RACE_CONFIG.RACER_SIZE,
  },
  racerImage: {
    width: '100%',
    height: '100%',
  },
})
