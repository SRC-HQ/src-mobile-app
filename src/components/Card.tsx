import React from 'react'
import { View, ViewProps } from 'react-native'

interface CardProps extends ViewProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <View className={`bg-card rounded-2xl p-6 ${className}`} {...props}>
      {children}
    </View>
  )
}
