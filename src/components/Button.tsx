import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native'
import { theme } from '../config/theme'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  loading?: boolean
  disabled?: boolean
  className?: string
  style?: ViewStyle
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  style,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary'
      case 'secondary':
        return 'bg-secondary'
      case 'outline':
        return 'bg-transparent border-2 border-primary'
      default:
        return 'bg-primary'
    }
  }

  const handlePress = () => {
    console.log('Button pressed:', title)
    onPress()
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={style}
      className={`px-6 py-4 rounded-xl items-center justify-center ${getVariantClasses()} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.white} />
      ) : (
        <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white text-base">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  )
}
