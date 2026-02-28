import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { AvatarDefaultIcon, SolColorIconSvg } from '../../../components/svgs'

interface NavbarProps {
  leftInset?: number
  rightInset?: number
  onOpenSettings: () => void
}

export const Navbar = ({ leftInset = 0, rightInset = 0, onOpenSettings }: NavbarProps) => {
  const { account, connect } = useMobileWallet()
  const isConnected = !!account?.address

  // Mock balance - replace with actual balance from your wallet hook
  const balance = 0.0

  return (
    <View
      className="h-16 bg-[#0a0b0d] border-b border-white/10 flex-row items-center justify-between"
      style={{ paddingLeft: Math.max(16, leftInset), paddingRight: Math.max(16, rightInset) }}
    >
      {/* Left Side: Profile Avatar or Connect Button */}
      <View className="flex-row items-center">
        {isConnected ? (
          <Pressable onPress={onOpenSettings} className="w-10 h-10">
            <AvatarDefaultIcon width={40} height={40} />
          </Pressable>
        ) : (
          <Pressable onPress={connect} className="h-10 px-4 rounded-full flex-row items-center gap-2 bg-[#b6b0ff]">
            <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-xs text-black">
              Connect
            </Text>
          </Pressable>
        )}
      </View>

      {/* Center: Empty */}
      <View className="flex-1" />

      {/* Right Side: Balance */}
      {isConnected && (
        <View className="flex-row items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <SolColorIconSvg width={16} height={14} />
          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-sm text-white">
            {balance.toFixed(4)}
          </Text>
        </View>
      )}
    </View>
  )
}
