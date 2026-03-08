import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ImageBackground, Image, useWindowDimensions } from 'react-native'
import { useFonts, Orbitron_400Regular, Orbitron_700Bold, Orbitron_900Black } from '@expo-google-fonts/orbitron'

const LOGO_SRC = require('../../../assets/game/images/src-logo.png')
const BG_SRC = require('../../../assets/game/images/background.png')

export const PreparationScene: React.FC = () => {
  const [dots, setDots] = useState('')
  const { width, height } = useWindowDimensions()
  const isLandscape = width > height

  // Load Orbitron font
  const [fontsLoaded] = useFonts({
    Orbitron_400Regular,
    Orbitron_700Bold,
    Orbitron_900Black,
  })

  useEffect(() => {
    let count = 0
    const id = setInterval(() => {
      count = (count + 1) % 4
      setDots('.'.repeat(count))
    }, 500)
    return () => clearInterval(id)
  }, [])

  // Responsive logo size - smaller
  const logoWidth = isLandscape ? Math.min(320, width * 0.25) : Math.min(260, width * 0.55)

  // Responsive font size - smaller
  const titleSize = isLandscape ? Math.min(32, width * 0.025) : Math.min(24, width * 0.06)

  return (
    <View style={styles.container}>
      {/* Dark tiled background */}
      <ImageBackground source={BG_SRC} style={styles.background} imageStyle={styles.backgroundImage} />

      {/* Content */}
      <View style={styles.content}>
        <Image
          source={LOGO_SRC}
          style={[styles.logo, { width: logoWidth, height: logoWidth * 0.4 }]}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.title,
            {
              fontSize: titleSize,
              fontFamily: fontsLoaded ? 'Orbitron_700Bold' : undefined,
            },
          ]}
        >
          SELECT YOUR RACER{dots}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  backgroundImage: {
    resizeMode: 'repeat',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 20,
  },
  logo: {
    marginBottom: 20,
    // Drop shadow glow effect
    shadowColor: '#BBFF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  title: {
    color: '#BBFF00',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(187, 255, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    textTransform: 'uppercase',
  },
})
