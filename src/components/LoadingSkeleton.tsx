import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

interface SkeletonProps {
  width?: number | string
  height?: number | string
  borderRadius?: number
  className?: string
}

export const Skeleton = ({ width = '100%', height = 20, borderRadius = 8, className = '' }: SkeletonProps) => {
  const opacity = useSharedValue(0.3)

  useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(0.7, { duration: 800 }), withTiming(0.3, { duration: 800 })), -1)
  }, [opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  // Convert to proper types for Animated.View
  const widthValue = typeof width === 'string' ? width : width
  const heightValue = typeof height === 'string' ? height : height

  return (
    <Animated.View
      style={[
        {
          width: widthValue as any,
          height: heightValue as any,
          borderRadius,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        animatedStyle,
      ]}
      className={className}
    />
  )
}

export const LeaderboardSkeleton = () => {
  return (
    <View className="gap-3">
      {Array.from({ length: 10 }).map((_, index) => (
        <View key={index} className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <View className="flex-row items-center gap-3">
            <Skeleton width={40} height={40} borderRadius={20} />
            <View className="flex-1 flex-row items-center gap-3">
              <Skeleton width={48} height={48} borderRadius={24} />
              <View className="flex-1 gap-2">
                <Skeleton width="60%" height={14} />
                <Skeleton width="80%" height={10} />
              </View>
            </View>
            <View className="items-end gap-2">
              <Skeleton width={60} height={14} />
              <Skeleton width={40} height={10} />
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}

export const ProfileSkeleton = () => {
  return (
    <View>
      <View className="items-center py-8">
        <Skeleton width={100} height={100} borderRadius={50} className="mb-4" />
        <Skeleton width={150} height={20} className="mb-2" />
        <Skeleton width={200} height={14} />
      </View>
      <View className="px-6 py-4 gap-4">
        <View className="bg-white/5 border border-white/10 rounded-xl p-4">
          <Skeleton width={80} height={12} className="mb-2" />
          <Skeleton width="100%" height={16} />
        </View>
        <View className="bg-white/5 border border-white/10 rounded-xl p-4">
          <Skeleton width={100} height={12} className="mb-2" />
          <Skeleton width="100%" height={14} />
        </View>
      </View>
    </View>
  )
}

export const GameHistorySkeleton = () => {
  return (
    <View className="px-3 py-2 gap-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <View key={index} className="bg-[#13141a] rounded-lg p-3 border border-white/5">
          {/* Header Row */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Skeleton width={60} height={14} />
              <View className="h-3 w-px bg-white/20" />
              <Skeleton width={80} height={12} />
            </View>
            <Skeleton width={50} height={12} />
          </View>

          {/* Content Grid */}
          <View className="flex-row items-center justify-between">
            {/* Winner Icon */}
            <View className="items-center">
              <Skeleton width={24} height={10} className="mb-1" />
              <Skeleton width={32} height={32} borderRadius={16} />
            </View>

            {/* Winners Count */}
            <View className="items-center">
              <Skeleton width={50} height={10} className="mb-1" />
              <Skeleton width={40} height={14} />
            </View>

            {/* Total Pool */}
            <View className="items-center">
              <Skeleton width={60} height={10} className="mb-1" />
              <Skeleton width={70} height={14} />
            </View>

            {/* Baby King */}
            <View className="items-center">
              <Skeleton width={60} height={10} className="mb-1" />
              <Skeleton width={40} height={20} borderRadius={4} />
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}
