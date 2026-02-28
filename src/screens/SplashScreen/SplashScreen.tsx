import React, { useEffect, useRef } from 'react'
import { View, Image, Animated } from 'react-native'

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={require('../../../assets/src-logo.png')}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  )
}
