import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Image, ImageBackground, useWindowDimensions } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated'
import { useFonts, Orbitron_700Bold, Orbitron_900Black } from '@expo-google-fonts/orbitron'
import { useGameStore } from '../../stores/gameStore'
import { RACER_NAMES, ASSETS } from '../../game/constants'
import { FRAME, RACER_COUNT } from '../../game/constants/raceConstants'

const BG_SRC = require('../../../assets/game/images/background.png')
const ORDINALS = ['1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', '10TH']

/**
 * Animated spritesheet component for winner racer
 * Uses Reanimated to match RaceScene animation exactly
 */
const AnimatedRacerSprite: React.FC<{ racerId: number }> = ({ racerId }) => {
  // Use Reanimated shared value like in RaceScene
  const frameValue = useSharedValue(0)
  const scale = 0.5 // Display scale for mobile

  useEffect(() => {
    // Continuous frame animation matching RaceScene
    // frameSpeed = 0.8 per frame, cycling through 0-9
    frameValue.value = withRepeat(
      withTiming(FRAME.COUNT, {
        duration: (FRAME.COUNT / 0.8) * 16.67, // ~208ms for full cycle at 60fps
        easing: Easing.linear,
      }),
      -1, // Infinite repeat
      false,
    )
  }, [frameValue])

  // Animated style matching RaceScene's spriteAnimatedStyle
  const spriteAnimatedStyle = useAnimatedStyle(() => {
    const frameIndex = Math.floor(frameValue.value % FRAME.COUNT)
    return {
      transform: [{ translateX: -frameIndex * FRAME.WIDTH * scale }],
    }
  })

  return (
    <View style={winnerStyles.spriteContainer}>
      <Animated.Image
        source={ASSETS.RACERS[racerId]}
        style={[winnerStyles.spriteSheet, spriteAnimatedStyle]}
        resizeMode="stretch"
      />
    </View>
  )
}

export const DistributionScene: React.FC = () => {
  const { winner, leaderboard, totalPot, sperms } = useGameStore()
  const { width, height } = useWindowDimensions()
  const isLandscape = width > height

  const [fontsLoaded] = useFonts({
    Orbitron_700Bold,
    Orbitron_900Black,
  })

  const getLeaderboardData = () => {
    if (!leaderboard || leaderboard.length === 0) {
      return Array.from({ length: RACER_COUNT }, (_, i) => i)
    }
    return leaderboard.slice(0, RACER_COUNT)
  }

  const getBettorCount = (spermId: number) => {
    return sperms.find((s) => s.spermId === spermId)?.bettorCount || 0
  }

  const winnerId = leaderboard?.[0] ?? winner ?? 0
  const totalWinSol = (parseInt(totalPot) / 1e9).toFixed(3)

  return (
    <View style={styles.container}>
      {/* Tiled dark background */}
      <ImageBackground source={BG_SRC} style={styles.background} imageStyle={styles.backgroundImage} />
      <View style={styles.gradient} />

      {/* Two-column layout - fills without scrolling */}
      <View style={styles.content}>
        {/* LEFT: Race Result table */}
        <View style={styles.leftColumn}>
          <Text style={[styles.sectionTitle, { fontFamily: fontsLoaded ? 'Orbitron_700Bold' : undefined }]}>
            Race Result
          </Text>

          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, { fontFamily: fontsLoaded ? 'Orbitron_700Bold' : undefined }]}>Pos</Text>
            <Text
              style={[
                styles.headerText,
                styles.headerTextWide,
                { fontFamily: fontsLoaded ? 'Orbitron_700Bold' : undefined },
              ]}
            >
              Racer No & Name
            </Text>
          </View>

          {/* Rows - evenly distributed without scrolling */}
          <View style={styles.tableRows}>
            {getLeaderboardData().map((racerId, rank) => {
              const isTop3 = rank < 3

              return (
                <View key={racerId} style={styles.tableRow}>
                  <Text
                    style={[
                      styles.posText,
                      isTop3 && styles.posTextTop3,
                      { fontFamily: fontsLoaded ? 'Orbitron_700Bold' : undefined },
                    ]}
                  >
                    {ORDINALS[rank]}
                  </Text>

                  <Image source={ASSETS.ICONS[racerId]} style={styles.rowIcon} resizeMode="contain" />

                  <Text style={[styles.racerNameText, isTop3 && styles.racerNameTextTop3]} numberOfLines={1}>
                    {RACER_NAMES[racerId]}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* RIGHT: Winner showcase */}
        <View style={styles.rightColumn}>
          <Text style={[styles.winnerLabel, { fontFamily: fontsLoaded ? 'Orbitron_900Black' : undefined }]}>
            WINNER
          </Text>

          {/* Animated winner racer with glow */}
          <View style={styles.winnerImageContainer}>
            {/* <View style={styles.winnerGlow} /> */}
            <AnimatedRacerSprite racerId={winnerId} />
          </View>

          {/* Winner name with icon */}
          <View style={styles.winnerInfo}>
            <Image source={ASSETS.ICONS[winnerId]} style={styles.winnerIcon} resizeMode="contain" />
            <Text
              style={[styles.winnerName, { fontFamily: fontsLoaded ? 'Orbitron_900Black' : undefined }]}
              numberOfLines={1}
            >
              {RACER_NAMES[winnerId]}
            </Text>
          </View>

          {/* Total win */}
          <View style={styles.winAmount}>
            <Text style={[styles.winLabel, { fontFamily: fontsLoaded ? 'Orbitron_700Bold' : undefined }]}>
              TOTAL PRIZES
            </Text>
            <Text style={[styles.winValue, { fontFamily: fontsLoaded ? 'Orbitron_900Black' : undefined }]}>
              {totalWinSol} SOL
            </Text>
          </View>

          {/* Bettor count */}
          <Text style={styles.bettorCount}>{getBettorCount(winnerId)} winner(s)</Text>
        </View>
      </View>
    </View>
  )
}

const winnerStyles = StyleSheet.create({
  spriteContainer: {
    width: FRAME.WIDTH * 0.5, // Scale up to 50% for better visibility
    height: FRAME.HEIGHT * 0.5,
    overflow: 'hidden',
  },
  spriteSheet: {
    width: FRAME.WIDTH * FRAME.COUNT * 0.5,
    height: FRAME.HEIGHT * 0.5,
  },
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12122a',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.12,
  },
  backgroundImage: {
    resizeMode: 'repeat',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 12,
  },
  leftColumn: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionTitle: {
    color: '#BBFF00',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(187, 255, 0, 0.3)',
    marginBottom: 1,
  },
  headerText: {
    color: '#BBFF00',
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    width: 26,
  },
  headerTextWide: {
    flex: 1,
    width: 'auto',
  },
  tableRows: {
    flex: 1,
    justifyContent: 'space-between', // Changed from space-evenly to space-between
    paddingVertical: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 3,
    paddingVertical: 0.5,
    height: 20, // Fixed height instead of minHeight
  },
  posText: {
    width: 26,
    fontSize: 8,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  posTextTop3: {
    color: '#ffffff',
  },
  rowIcon: {
    width: 15,
    height: 15,
  },
  racerNameText: {
    flex: 1,
    fontSize: 8,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  racerNameTextTop3: {
    color: '#ffffff',
  },
  rightColumn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  winnerLabel: {
    color: '#BBFF00',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 4,
  },
  winnerImageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
    width: 120,
    marginVertical: 12,
  },
  winnerGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(187, 255, 0, 0.15)',
  },
  winnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    maxWidth: '100%',
  },
  winnerIcon: {
    width: 24,
    height: 24,
  },
  winnerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    flexShrink: 1,
  },
  winAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 6,
  },
  winLabel: {
    color: '#65EF96',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  winValue: {
    color: '#65EF96',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bettorCount: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    marginTop: 2,
  },
})
