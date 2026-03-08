/**
 * RaceScene - Mobile implementation matching web RaceOverlayV2.tsx
 * Features: Parallax scrolling, spritesheet animation, jitter, lock-to-final-order
 * Optimized for performance with Reanimated
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { View, StyleSheet, Image, useWindowDimensions } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated'
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
  FRAME,
  DEBUG_FINISH_OFFSET_X,
} from '../../game/constants/raceConstants'
import { ASSETS } from '../../game/constants'

interface JitterEntry {
  phases: number[]
  freqs: number[]
  amp: number
}

export const RaceScene: React.FC = () => {
  const { width, height } = useWindowDimensions()
  const isLandscape = width > height

  const { phase, raceParams, phaseStartedAt, phaseEndsAt, phaseReceivedAt } = useGameStore()

  const mountTimeRef = useRef(Date.now())
  const lastTimeRef = useRef(Date.now())

  // Use Reanimated shared values for better performance - must be at top level
  const skyOffset = useSharedValue(0)
  const billboardOffset = useSharedValue(0)
  const groundOffset = useSharedValue(0)

  // Create racer shared values at top level - explicit creation to avoid hook errors
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

  const racer0Frame = useSharedValue(0)
  const racer1Frame = useSharedValue(0)
  const racer2Frame = useSharedValue(0)
  const racer3Frame = useSharedValue(0)
  const racer4Frame = useSharedValue(0)
  const racer5Frame = useSharedValue(0)
  const racer6Frame = useSharedValue(0)
  const racer7Frame = useSharedValue(0)
  const racer8Frame = useSharedValue(0)
  const racer9Frame = useSharedValue(0)

  const racerXValues = useMemo(
    () => [racer0X, racer1X, racer2X, racer3X, racer4X, racer5X, racer6X, racer7X, racer8X, racer9X],
    [racer0X, racer1X, racer2X, racer3X, racer4X, racer5X, racer6X, racer7X, racer8X, racer9X],
  )
  const racerFrameValues = useMemo(
    () => [
      racer0Frame,
      racer1Frame,
      racer2Frame,
      racer3Frame,
      racer4Frame,
      racer5Frame,
      racer6Frame,
      racer7Frame,
      racer8Frame,
      racer9Frame,
    ],
    [
      racer0Frame,
      racer1Frame,
      racer2Frame,
      racer3Frame,
      racer4Frame,
      racer5Frame,
      racer6Frame,
      racer7Frame,
      racer8Frame,
      racer9Frame,
    ],
  )

  const [iconOrder, setIconOrder] = useState<number[]>(Array.from({ length: RACER_COUNT }, (_, i) => i))
  const pinProgress = useSharedValue(0)

  // Finish line position - starts off-screen to the right
  const finishLineX = useSharedValue(RACE.endlineX)
  const finishEndX = useSharedValue(RACE.endlineX + RACE.endSpriteOffsetX)

  // Track if finish line has been triggered
  const finishTriggeredRef = useRef(false)

  // Throttle UI updates to reduce re-renders
  const lastUIUpdateRef = useRef(0)
  const UI_UPDATE_INTERVAL = 100 // Update UI every 100ms instead of every frame

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

  // Animation tick
  const tick = useCallback(() => {
    if (phase !== 'RACE') return

    const now = Date.now()
    const deltaMs = now - lastTimeRef.current
    lastTimeRef.current = now
    const deltaS = deltaMs / 1000

    // Calculate race progress
    let elapsed = now - effStart
    if (elapsed < 0) elapsed = Math.max(0, now - mountTimeRef.current)
    const baseT = effDuration > 0 ? Math.min(1, Math.max(0, elapsed) / effDuration) : 0

    // Ensure race finishes exactly at duration end
    const t = Math.min(1, baseT)
    // Progress should reach 100% when time is up, regardless of racer positions
    const raceProgress = t * 100

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

    // Jitter effect (organic speed variation)
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

    // Lock to final order (last 6 seconds)
    const LOCK_BLEND_AT = ANIMATION.LOCK_BLEND_AT
    const LOCK_FULL_AT = ANIMATION.LOCK_FULL_AT
    let lockBlend = 0
    if (remainingMs < LOCK_BLEND_AT && hasParams && raceParams) {
      const linear = remainingMs < LOCK_FULL_AT ? 1 : 1 - (remainingMs - LOCK_FULL_AT) / (LOCK_BLEND_AT - LOCK_FULL_AT)
      lockBlend = linear * linear * (3 - 2 * linear) // smoothstep
    }

    // Pack-center positioning (all racers move forward)
    const norms = rawProgs.map((p) => p / MAX_BASE_SPEED)
    const packCenter = norms.reduce((s, v) => s + v, 0) / RACER_COUNT

    const racerWorldX: number[] = []
    const [rxMin, rxMax] = RACE.rangeX

    // Calculate finish line position - ensure racers reach it when time is up
    const racerFinishLineX = rxMax // Keep racers within visible range

    if (lockBlend > 0 && hasParams && raceParams) {
      const finalProgs = raceParams.map((p) => (p ? progressAtT(p, 1.0) : 0))
      const maxFinal = Math.max(...finalProgs, 0.001)
      const minFinal = Math.min(...finalProgs)
      const finalRange = maxFinal - minFinal || 0.001

      for (let n = 0; n < RACER_COUNT; n++) {
        const deviation = (norms[n] - packCenter) * ANIMATION.SPREAD_MULT
        const packNorm = Math.max(0, Math.min(1, packCenter + deviation))
        const packX = rxMin + (rxMax - rxMin) * packNorm

        // Calculate final position based on racer's actual progress
        const finalRatio = (finalProgs[n] - minFinal) / finalRange
        // Keep racers within visible range
        const finalX = rxMin + (racerFinishLineX - rxMin) * finalRatio

        racerWorldX.push(packX * (1 - lockBlend) + finalX * lockBlend)
      }
    } else {
      for (let n = 0; n < RACER_COUNT; n++) {
        const deviation = (norms[n] - packCenter) * ANIMATION.SPREAD_MULT
        const norm = Math.max(0, Math.min(1, packCenter + deviation))
        // Keep racers within visible range
        const targetX = rxMin + (racerFinishLineX - rxMin) * norm
        racerWorldX.push(targetX)
      }
    }

    // Parallax background scrolling - direct value updates for smooth animation
    const bgSpeed = RACE.raceSpeed * (0.6 + t * 0.3) // Reduced speed

    // Update offsets with proper wrapping to prevent visual duplication
    skyOffset.value -= deltaS * bgSpeed * PARALLAX_MULT.sky
    if (skyOffset.value <= -width) skyOffset.value += width

    billboardOffset.value -= deltaS * bgSpeed * PARALLAX_MULT.billboard
    if (billboardOffset.value <= -width) billboardOffset.value += width

    groundOffset.value -= deltaS * bgSpeed * PARALLAX_MULT.ground
    if (groundOffset.value <= -width) groundOffset.value += width

    // End line scrolls in near the finish (when progress > 92%)
    if (raceProgress > ANIMATION.END_LINE_TRIGGER) {
      if (!finishTriggeredRef.current) {
        finishTriggeredRef.current = true
      }
      const endSpeed = bgSpeed * 1.5
      finishLineX.value -= deltaS * endSpeed
      finishEndX.value -= deltaS * endSpeed
    }

    // When race is complete (t >= 1), adjust racer positions to touch finish line
    if (t >= 1 && hasParams && raceParams) {
      // Find the leader (racer with highest position)
      let leaderIndex = 0
      let leaderX = racerWorldX[0]
      for (let n = 1; n < RACER_COUNT; n++) {
        if (racerWorldX[n] > leaderX) {
          leaderX = racerWorldX[n]
          leaderIndex = n
        }
      }

      // Calculate offset to make leader touch finish line
      const finishX = finishLineX.value + DEBUG_FINISH_OFFSET_X
      const dx = finishX - leaderX

      // Apply offset to all racers to maintain relative positions
      for (let n = 0; n < RACER_COUNT; n++) {
        racerWorldX[n] += dx
      }
    }

    // Update racer positions with smooth interpolation
    const lerpSpeed = ANIMATION.LERP_SPEED + lockBlend * ANIMATION.LERP_SPEED_LOCKED
    for (let n = 0; n < RACER_COUNT; n++) {
      const currentX = racerXValues[n].value
      const targetX = racerWorldX[n]
      racerXValues[n].value = currentX + (targetX - currentX) * lerpSpeed

      // Animate sprite frames - simplified for better performance
      const frameSpeed = 0.8
      racerFrameValues[n].value = (racerFrameValues[n].value + frameSpeed) % FRAME.COUNT
    }

    // Update pin progress - ensure it reaches 100% when time is up and leader touches finish
    // Pin should move based on actual race progress (time-based)
    pinProgress.value = raceProgress

    // When race is complete, ensure pin is at 100%
    if (t >= 1) {
      pinProgress.value = 100
    }

    // Throttle UI updates to reduce re-renders
    if (now - lastUIUpdateRef.current >= UI_UPDATE_INTERVAL) {
      lastUIUpdateRef.current = now

      // Update icon order based on positions
      const order = racerWorldX
        .map((x, i) => ({ i, x }))
        .sort((a, b) => b.x - a.x)
        .map((s) => s.i)
      setIconOrder(order)
    }
  }, [
    phase,
    effStart,
    effDuration,
    hasParams,
    raceParams,
    skyOffset,
    billboardOffset,
    groundOffset,
    racerXValues,
    racerFrameValues,
    finishLineX,
    finishEndX,
    width,
  ])

  // Animation loop
  useEffect(() => {
    if (phase !== 'RACE') return

    let rafId: number
    const loop = () => {
      tick()
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [tick, phase])

  // Scale factor for mobile
  const scale = isLandscape ? width / 1280 : width / 768

  return (
    <View style={styles.container}>
      {/* Parallax backgrounds */}
      <ParallaxLayer source={field.sky} offset={skyOffset} top={RACE.skyY} height={250} scale={scale} />
      <ParallaxLayer
        source={field.billboard}
        offset={billboardOffset}
        top={RACE.billboardY}
        height={300}
        scale={scale}
      />
      <ParallaxLayer source={field.race} offset={groundOffset} top={RACE.groundY} height={500} scale={scale} />

      {/* Racers */}
      {Array.from({ length: RACER_COUNT }).map((_, index) => {
        const mobileLaneSpacing = RACE.laneSpaceY * 0.5
        const mobileStartY = RACE.groundY + 220
        const laneY = (mobileStartY + index * mobileLaneSpacing) * scale
        const racerScale = 0.4

        return (
          <RacerComponent
            key={index}
            index={index}
            laneY={laneY}
            racerScale={racerScale}
            scale={scale}
            xValue={racerXValues[index]}
            frameValue={racerFrameValues[index]}
            shadowSource={field.shadow}
          />
        )
      })}

      {/* Finish line - scrolls in from right when race progress > 92% */}
      <FinishLineComponent
        finishLineX={finishLineX}
        finishEndX={finishEndX}
        scale={scale}
        endlineSource={field.endline}
        endSource={field.end}
      />

      {/* Scorebar with race score background */}
      <ScorebarComponent height={height} pinProgress={pinProgress} iconOrder={iconOrder} />
    </View>
  )
}

// Memoized parallax layer component with seamless looping
const ParallaxLayer = React.memo(({ source, offset, top, height, scale }: any) => {
  const { width } = useWindowDimensions()

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }))

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value + width }],
  }))

  return (
    <>
      <Animated.Image
        source={source}
        style={[styles.parallaxLayer, animatedStyle1, { top: top * scale, height: height * scale, width }]}
        resizeMode="none"
      />
      <Animated.Image
        source={source}
        style={[styles.parallaxLayer, animatedStyle2, { top: top * scale, height: height * scale, width }]}
        resizeMode="none"
      />
    </>
  )
})
ParallaxLayer.displayName = 'ParallaxLayer'

// Memoized racer component
const RacerComponent = React.memo(({ index, laneY, racerScale, scale, xValue, frameValue, shadowSource }: any) => {
  const racerWidth = FRAME.WIDTH * racerScale * scale
  const racerHeight = FRAME.HEIGHT * racerScale * scale

  const racerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: xValue.value }],
  }))

  const spriteAnimatedStyle = useAnimatedStyle(() => {
    const frameIndex = Math.floor(frameValue.value)
    return {
      transform: [{ translateX: -frameIndex * FRAME.WIDTH * racerScale * scale }],
    }
  })

  return (
    <View style={{ position: 'absolute', top: laneY, zIndex: RACER_COUNT - index }}>
      {/* Racer with sprite animation */}
      <Animated.View
        style={[
          styles.racerContainer,
          racerAnimatedStyle,
          {
            width: racerWidth,
            height: racerHeight,
          },
        ]}
      >
        <Animated.Image
          source={ASSETS.RACERS[index]}
          style={[
            styles.racerSprite,
            spriteAnimatedStyle,
            {
              width: FRAME.WIDTH * FRAME.COUNT * racerScale * scale,
              height: racerHeight,
            },
          ]}
          resizeMode="stretch"
        />
      </Animated.View>

      {/* Shadow - positioned below racer */}
      {/* <Animated.View
        style={[
          styles.shadowContainer,
          racerAnimatedStyle,
          {
            top: racerHeight * -3.2,
            left: -105 * scale,
          },
        ]}
      >
        <Image
          source={shadowSource}
          style={{
            width: 35 * scale,
            height: 18 * scale,
            opacity: 0.4,
          }}
          resizeMode="contain"
        />
      </Animated.View> */}
    </View>
  )
})
RacerComponent.displayName = 'RacerComponent'

// Memoized scorebar component with animated pin
const ScorebarComponent = React.memo(({ height, pinProgress, iconOrder }: any) => {
  const pinAnimatedStyle = useAnimatedStyle(() => {
    const progress = Math.min(100, Math.max(0, pinProgress.value))
    const pinX =
      SCOREBAR.PIN_RANGE.startX +
      (progress / 100) * (SCOREBAR.PIN_RANGE.endX - SCOREBAR.PIN_RANGE.startX) +
      SCOREBAR.PIN_X_OFFSET

    return {
      left: pinX,
    }
  })

  return (
    <View style={[styles.scorebar, { bottom: height * (1 - SCOREBAR.Y_PERCENT) }]}>
      <View style={[styles.scoreContainer, { transform: [{ scale: SCOREBAR.SCALE }] }]}>
        <Image
          source={require('../../../assets/game/images/item_race_score.png')}
          style={styles.scorebarBg}
          resizeMode="contain"
        />

        {/* Race pin indicator - animated */}
        <Animated.Image
          source={require('../../../assets/game/images/item_race_pin.png')}
          style={[
            styles.racePin,
            pinAnimatedStyle,
            {
              top: SCOREBAR.PIN_Y,
              transform: [{ scale: SCOREBAR.PIN_SCALE }],
            },
          ]}
          resizeMode="contain"
        />

        {/* Icon row - positioned with OFFSET_X */}
        <View style={[styles.scoreListContainer, { left: SCOREBAR.OFFSET_X }]}>
          {iconOrder.map((racerId: number, rank: number) => (
            <Image
              key={racerId}
              source={ASSETS.ICONS[racerId]}
              style={[
                styles.icon,
                {
                  left: rank * SCOREBAR.ICON_SPACING + SCOREBAR.ICON_X,
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
  )
})
ScorebarComponent.displayName = 'ScorebarComponent'

// Memoized finish line component that scrolls in from the right
const FinishLineComponent = React.memo(({ finishLineX, finishEndX, scale, endlineSource, endSource }: any) => {
  const finishLineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: finishLineX.value * scale }],
  }))

  const finishEndAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: finishEndX.value * scale }],
  }))

  return (
    <>
      {/* Finish line vertical stripe */}
      <Animated.View
        style={[
          styles.finishLine,
          finishLineAnimatedStyle,
          {
            top: (RACE.groundY + RACE.endlineTopOffset) * scale,
          },
        ]}
      >
        <Image
          source={endlineSource}
          style={{
            width: RACE.endlineWidth * scale,
            height: RACE.endlineHeight * scale,
          }}
          resizeMode="stretch"
        />
      </Animated.View>

      {/* Finish end sprite (banner/decoration) */}
      <Animated.View
        style={[
          styles.finishEnd,
          finishEndAnimatedStyle,
          {
            top: (RACE.endlineY + RACE.endSpriteOffsetY) * scale,
          },
        ]}
      >
        <Image
          source={endSource}
          style={{
            width: RACE.endWidth * scale,
            height: RACE.endHeight * scale,
          }}
          resizeMode="contain"
        />
      </Animated.View>
    </>
  )
})
FinishLineComponent.displayName = 'FinishLineComponent'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    overflow: 'hidden',
  },
  parallaxLayer: {
    position: 'absolute',
    left: 0,
  },
  shadow: {
    position: 'absolute',
    opacity: 0.5,
  },
  shadowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  racerContainer: {
    position: 'absolute',
    overflow: 'hidden',
    // Anchor point adjustment (matching web: RACER_REG_X / FRAME_W, RACER_REG_Y / FRAME_H)
    marginLeft: -(FRAME.REG_X / FRAME.WIDTH) * FRAME.WIDTH,
    marginTop: -(FRAME.REG_Y / FRAME.HEIGHT) * FRAME.HEIGHT,
  },
  racerSprite: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  scorebar: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100, // Above all race elements including finish line
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
    zIndex: 10, // Ensure pin is above other elements
  },
  scoreListContainer: {
    position: 'absolute',
    flexDirection: 'row',
    zIndex: 5, // Below pin but above background
  },
  icon: {
    position: 'absolute',
    width: 64,
    height: 64,
  },
  finishLine: {
    position: 'absolute',
    zIndex: 1, // Below racers (racers have zIndex based on RACER_COUNT)
  },
  finishEnd: {
    position: 'absolute',
    zIndex: 2, // Slightly above finish line but still below racers
  },
})
