import React from 'react'
import { Text as RNText, TextProps as RNTextProps } from 'react-native'

interface CustomTextProps extends RNTextProps {
  variant?: 'title' | 'body'
  weight?: 'regular' | 'bold' | 'black'
}

export const Text = ({ variant = 'body', weight = 'regular', style, ...props }: CustomTextProps) => {
  const getFontFamily = () => {
    if (variant === 'title') {
      if (weight === 'black') return 'Orbitron_900Black'
      if (weight === 'bold') return 'Orbitron_700Bold'
      return 'Orbitron_400Regular'
    }
    // body variant
    if (weight === 'bold') return 'SpaceMono_700Bold'
    return 'SpaceMono_400Regular'
  }

  return <RNText style={[{ fontFamily: getFontFamily() }, style]} {...props} />
}
