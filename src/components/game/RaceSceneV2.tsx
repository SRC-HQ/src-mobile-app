/**
 * RaceSceneV2 - Mobile implementation matching web RaceOverlayV2.tsx
 * Uses Reanimated for smooth 60fps animations
 */

import React, { useRef, useState } from 'react'
import { View, StyleSheet, Image, useWindowDimensions } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, useFrameCallback } from 'react-native-reanimated'
import { useGameStore } from '../../stores/gameStore'
import { progressAtT, MAX_BASE_SPEED } from '../../game/utils/raceProgress'
import {
  RACER_COUNT,
  RACE,
  PARALLAX_MULT,
  ANIMATION,
  SCOREBAR,
  FIELD_SETTINGS,
  FALLBACK_DURATION_MS,
} from '../../game/constants/raceConstants'
import { ASSETS } from '../../game/constants'

interface RaceSceneV2Props {
  preRace?: boolean
}

interface JitterEntry {
  phases: number[]
  freqs: number[]
  amp: number
}

export const RaceSceneV2: React.FC<RaceSceneV2Props> = ({ preRace = false }) => {
  const { width, height } = useWindowDimensions()
  const isLandscape = width > height

  const { raceParams, phaseStartedAt, phaseEndsAt, phaseReceivedAt } = useGameStore()

  const mountTimeRef = useRef(Date.now())

  // Shared values for smooth animations
  const parallaxSky = useSharedValue(0)
  const parallaxBillboard = useSharedValue(0)
  const parallaxGround = useSharedValue(0)

  // Initialize racer positions - create 10 shared values
  const racer0X = useSharedValue(RACE.rangeX[0])
  const racer1X = useSharedValue(RACE.rangeX[0])
  const racer2X = useSharedValue(RACE.rangeX[0])
  const racer3X = useSharedValue(RACE.rangeX[0])
  const racer4X = useSharedValue(RACE.rangeX[0])
  const racer5X = useSharedValue(RACE.rangeX[0])
  const racer6X = useSharedValue(RACE.rangeX[0])
  const racer7X = useSharedValue(RACE.rangeX[0])
  const racer8X = useSharedValue(RACE.rangeX[0])
  const racer9X = useSharedValue(RACE.rangeX[0])

  const racerXPositions = [racer0X, racer1X, racer2X, racer3X, racer4X, racer5X, racer6X, racer7X, racer8X, racer9X]

  const [iconOrder, setIconOrder] = useState<number[]>(Array.from({ length: RACER_COUNT }, (_, i) => i))
  const pinProgress = useSharedValue(0)

  // Calculate effective times
  const dur = phaseEndsAt - phaseStartedAt
  const hasValid = dur > 0
  const effStart = hasValid ? phaseReceivedAt || phaseStartedAt : mountTimeRef.current
  const effDuration = hasValid ? dur : FALLBACK_DURATION_MS
  const hasParams = !!(raceParams && raceParams.length >= RACER_COUNT)

  // Select field based on round
  const fieldIndex = Math.floor((phaseStartedAt || Date.now()) / 10000) % FIELD_SETTINGS.length
  const field = FIELD_SETTINGS[fieldIndex]

  // Jitter data (organic speed variation)
  const jitterRef = useRef<JitterEntry[] | null>(null)
  if (!jitterRef.current) {
    const TAU = Math.PI * 2
    const j: JitterEntry[] = []
    for (let i = 0; i < RACER_COUNT; i++) {
      j.push({
        phases: [Math.random() * TAU, Math.random() * TAU, Math.random() * TAU],
        freqs: [1.5 + Math.random() * 1.5, 3 + Math.random() * 3, 0.6 + Math.random() * 1],
        amp: 0.04 + Math.random() * 0.05,
      })
    }
    jitterRef.current = j
  }

  // Frame callback for smooth 60fps animation
  useFrameCallback((frameInfo) => {
    'worklet'
    const now = Date.now()
    const deltaS = frameInfo.timeSincePreviousFrame ? frameInfo.timeSincePreviousFrame / 1000 : 0.016

    // PRE-RACE: entrance animation
    if (preRace) {
      const entElapsed = now - mountTimeRef.current
      const startX = RACE.rangeX[0]
      const offScreenX = startX + ANIMATION.ENTRANCE_OFF_SCREEN_X

      for (let n = 0; n < RACER_COUNT; n++) {
        const racerElapsed = Math.max(0, entElapsed - n * ANIMATION.ENTRANCE_STAGGER)
        const t = Math.min(1, racerElapsed / ANIMATION.ENTRANCE_DURATION)
        const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
        const x = offScreenX + (startX - offScreenX) * eased
        racerXPositions[n].value = x
      }

      // Idle parallax
      const idleSpeed = RACE.raceSpeed * 0.08
      parallaxSky.value = (parallaxSky.value - deltaS * idleSpeed * PARALLAX_MULT.sky) % width
      parallaxBillboard.value = (parallaxBillboard.value - deltaS * idleSpeed * PARALLAX_MULT.billboard) % width
      parallaxGround.value = (parallaxGround.value - deltaS * idleSpeed * PARALLAX_MULT.ground) % width

      pinProgress.value = 0
      return
    }

    // RACING MODE
    let elapsed = now - effStart
    if (elapsed < 0) elapsed = Math.max(0, now - mountTimeRef.current)
    const baseT = effDuration > 0 ? Math.min(1, Math.max(0, elapsed) / effDuration) : 0
    const t = Math.min(1, baseT)
    const raceProgress = Math.min(100, t * 100)

    // Calculate raw progress for each racer
    const rawProgs: number[] = []
    for (let n = 0; n < RACER_COUNT; n++) {
      if (hasParams && raceParams?.[n]) {
        rawProgs.push(progressAtT(raceParams[n], t))
      } else {
        rawProgs.push(t * MAX_BASE_SPEED)
      }
    }

    // Time remaining
    const remainingMs = Math.max(0, effDuration - elapsed)

    // Jitter effect
    const JITTER_FULL_AT = ANIMATION.JITTER_FULL_AT
    const JITTER_GONE_AT = ANIMATION.JITTER_GONE_AT
    const jitterFade =
      remainingMs > JITTER_FULL_AT
        ? 1
        : remainingMs < JITTER_GONE_AT
          ? 0
          : (remainingMs - JITTER_GONE_AT) / (JITTER_FULL_AT - JITTER_GONE_AT)

    if (jitterFade > 0 && jitterRef.current) {
      const TAU = Math.PI * 2
      for (let n = 0; n < RACER_COUNT; n++) {
        const jp = jitterRef.current[n]
        const noise =
          Math.sin(t * jp.freqs[0] * TAU + jp.phases[0]) * 0.5 +
          Math.sin(t * jp.freqs[1] * TAU + jp.phases[1]) * 0.3 +
          Math.sin(t * jp.freqs[2] * TAU + jp.phases[2]) * 0.2
        rawProgs[n] += noise * jp.amp * jitterFade
      }
    }

    // Lock to final order
    const LOCK_BLEND_AT = ANIMATION.LOCK_BLEND_AT
    const LOCK_FULL_AT = ANIMATION.LOCK_FULL_AT
    let lockBlend = 0
    if (remainingMs < LOCK_BLEND_AT && hasParams && raceParams) {
      const linear = remainingMs < LOCK_FULL_AT ? 1 : 1 - (remainingMs - LOCK_FULL_AT) / (LOCK_BLEND_AT - LOCK_FULL_AT)
      lockBlend = linear * linear * (3 - 2 * linear) // smoothstep
    }

    // Pack-center positioning
    const norms = rawProgs.map((p) => p / MAX_BASE_SPEED)
    const packCenter = norms.reduce((s, v) => s + v, 0) / RACER_COUNT

    const racerWorldX: number[] = []
    const [rxMin, rxMax] = RACE.rangeX
    const finishLineX = rxMax + 100
    const isNearFinish = t >= 0.95

    if (lockBlend > 0 && hasParams && raceParams) {
      const finalProgs = raceParams.map((p) => (p ? progressAtT(p, 1.0) : 0))
      const maxFinal = Math.max(...finalProgs, 0.001)
      const minFinal = Math.min(...finalProgs)
      const finalRange = maxFinal - minFinal || 0.001

      for (let n = 0; n < RACER_COUNT; n++) {
        const deviation = (norms[n] - packCenter) * ANIMATION.SPREAD_MULT
        const packNorm = Math.max(0, Math.min(1, packCenter + deviation))
        const packX = rxMin + (rxMax - rxMin) * packNorm

        const finalRatio = (finalProgs[n] - minFinal) / finalRange
        let finalX = rxMin + (rxMax - rxMin) * finalRatio

        if (isNearFinish) {
          const finishProgress = (t - 0.95) / 0.05
          finalX = finalX + (finishLineX - finalX) * finishProgress
        }

        racerWorldX.push(packX * (1 - lockBlend) + finalX * lockBlend)
      }
    } else {
      for (let n = 0; n < RACER_COUNT; n++) {
        const deviation = (norms[n] - packCenter) * ANIMATION.SPREAD_MULT
        const norm = Math.max(0, Math.min(1, packCenter + deviation))
        let targetX = rxMin + (rxMax - rxMin) * norm

        if (isNearFinish) {
          const finishProgress = (t - 0.95) / 0.05
          targetX = targetX + (finishLineX - targetX) * finishProgress
        }

        racerWorldX.push(targetX)
      }
    }

    // Parallax background
    const bgSpeed = RACE.raceSpeed * (0.8 + t * 0.4)
    parallaxSky.value = (parallaxSky.value - deltaS * bgSpeed * PARALLAX_MULT.sky) % width
    parallaxBillboard.value = (parallaxBillboard.value - deltaS * bgSpeed * PARALLAX_MULT.billboard) % width
    parallaxGround.value = (parallaxGround.value - deltaS * bgSpeed * PARALLAX_MULT.ground) % width

    // Update racer positions with smooth lerp
    const lerpSpeed = ANIMATION.LERP_SPEED + lockBlend * ANIMATION.LERP_SPEED_LOCKED
    for (let n = 0; n < RACER_COUNT; n++) {
      const currentX = racerXPositions[n].value
      const targetX = racerWorldX[n]
      racerXPositions[n].value = currentX + (targetX - currentX) * lerpSpeed
    }

    // Update icon order
    const order = racerWorldX
      .map((x, i) => ({ i, x }))
      .sort((a, b) => b.x - a.x)
      .map((s) => s.i)
    runOnJS(setIconOrder)(order)

    // Update pin
    pinProgress.value = Math.min(raceProgress, 100)
  })

  // Animated styles for parallax layers
  const skyStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: parallaxSky.value }],
  }))

  const billboardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: parallaxBillboard.value }],
  }))

  const groundStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: parallaxGround.value }],
  }))

  // Animated styles for racers
  const racerStyles = racerXPositions.map((xPos) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({
      transform: [{ translateX: xPos.value }],
    })),
  )

  // Animated style for pin
  const pinStyle = useAnimatedStyle(() => ({
    left: SCOREBAR.PIN_RANGE.startX + (pinProgress.value / 100) * (SCOREBAR.PIN_RANGE.endX - SCOREBAR.PIN_RANGE.startX),
  }))

  // Scale factor for mobile
  const scale = isLandscape ? width / 1280 : width / 768

  return (
    <View style={styles.container}>
      {/* Parallax backgrounds */}
      <Animated.Image
        source={field.sky}
        style={[
          styles.parallaxLayer,
          skyStyle,
          {
            top: RACE.skyY * scale,
            height: 200 * scale,
          },
        ]}
        resizeMode="cover"
      />
      <Animated.Image
        source={field.billboard}
        style={[
          styles.parallaxLayer,
          billboardStyle,
          {
            top: RACE.billboardY * scale,
            height: 300 * scale,
            width: width,
          },
        ]}
        resizeMode="cover"
      />
      <Animated.Image
        source={field.race}
        style={[
          styles.parallaxLayer,
          groundStyle,
          {
            top: RACE.groundY * scale,
            height: 400 * scale,
          },
        ]}
        resizeMode="cover"
      />

      {/* Racers */}
      {Array.from({ length: RACER_COUNT }).map((_, index) => {
        const laneY = (RACE.startY + index * RACE.laneSpaceY) * scale
        return (
          <View key={index} style={{ position: 'absolute', top: laneY }}>
            {/* Racer */}
            <Animated.Image
              source={ASSETS.RACERS[index]}
              style={[
                styles.racer,
                racerStyles[index],
                {
                  width: 80 * scale,
                  height: 56 * scale,
                },
              ]}
              resizeMode="contain"
            />
            {/* Shadow */}
            <Animated.Image
              source={field.shadow}
              style={[
                styles.shadow,
                racerStyles[index],
                {
                  width: 60 * scale,
                  height: 30 * scale,
                  top: 40 * scale,
                },
              ]}
              resizeMode="contain"
            />
          </View>
        )
      })}

      {/* Scorebar */}
      <View style={[styles.scorebar, { bottom: height * (1 - SCOREBAR.Y_PERCENT) }]}>
        <View style={[styles.scoreContainer, { transform: [{ scale: SCOREBAR.SCALE }] }]}>
          <Image
            source={require('../../../assets/game/images/item_race_score.png')}
            style={styles.scorebarBg}
            resizeMode="contain"
          />

          {/* Race pin indicator */}
          <Animated.Image
            source={require('../../../assets/game/images/item_race_pin.png')}
            style={[
              styles.racePin,
              pinStyle,
              {
                top: SCOREBAR.PIN_Y,
              },
            ]}
            resizeMode="contain"
          />

          {/* Icon row */}
          <View style={[styles.scoreListContainer, { left: SCOREBAR.OFFSET_X }]}>
            {iconOrder.map((racerId, rank) => (
              <Image
                key={racerId}
                source={ASSETS.ICONS[racerId]}
                style={[
                  styles.icon,
                  {
                    left: rank * SCOREBAR.ICON_SPACING,
                    top: SCOREBAR.ICON_Y,
                    transform: [{ scale: SCOREBAR.ICON_SCALE }],
                  },
                ]}
                resizeMode="contain"
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    overflow: 'hidden',
  },
  parallaxLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  shadow: {
    position: 'absolute',
    opacity: 0.4,
  },
  racer: {
    position: 'absolute',
  },
  scorebar: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorebarBg: {
    width: 400,
    height: 100,
  },
  racePin: {
    position: 'absolute',
    width: 20,
    height: 20,
  },
  scoreListContainer: {
    position: 'absolute',
    flexDirection: 'row',
  },
  icon: {
    position: 'absolute',
    width: 64,
    height: 64,
  },
})
