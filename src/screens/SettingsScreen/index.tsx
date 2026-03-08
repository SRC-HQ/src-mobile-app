import React, { useState, useCallback } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AvatarDefaultIcon, QRCodeIconSvg, AccountIconSvg, LeaderboardIconSvg } from '../../components/svgs'
import { QRCodeBottomSheet } from './components/QRCodeBottomSheet'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { storageService } from '../../services/storage'
import { authService } from '../../services/auth'
import { STORAGE_KEYS } from '../../utils/constants'

interface SettingsScreenProps {
  onNavigateToProfile: () => void
  onNavigateToLeaderboard: () => void
  onClose: () => void
}

const SettingsScreenComponent = ({ onNavigateToProfile, onNavigateToLeaderboard, onClose }: SettingsScreenProps) => {
  const insets = useSafeAreaInsets()
  const { account, disconnect } = useMobileWallet()
  const [showQRCode, setShowQRCode] = useState(false)

  const handleDisconnect = useCallback(async () => {
    try {
      await storageService.removeItem(STORAGE_KEYS.WALLET_ADDRESS)
      await authService.clearAuth() // Clear authentication session
      await disconnect()
      onClose()
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }, [disconnect, onClose])

  const handleToggleQRCode = useCallback(() => {
    setShowQRCode((prev) => !prev)
  }, [])

  const address = account?.address?.toString() || ''

  return (
    <View className="flex-1 bg-[#0a0b0d]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4 border-b border-white/10">
        <View className="flex-row items-center justify-between">
          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-white text-xl">
            Settings
          </Text>
          <Pressable onPress={onClose} className="w-10 h-10 items-center justify-center rounded-lg active:bg-white/10">
            <Text className="text-white/80 text-3xl leading-none">×</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="items-center py-8 border-b border-white/10">
          <Pressable onPress={handleToggleQRCode} className="mb-3">
            <View className="relative">
              <AvatarDefaultIcon width={80} height={80} />
              {/* QR Icon Overlay */}
              <View className="absolute -right-1 -top-1 bg-[#b6b0ff] w-8 h-8 rounded-lg items-center justify-center border-2 border-[#0a0b0d]">
                <QRCodeIconSvg width={16} height={16} color="#000" />
              </View>
            </View>
          </Pressable>
          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white text-base mb-1">
            @username123
          </Text>
          <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/60 text-xs">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
          </Text>
        </View>

        {/* Menu Items */}
        <View className="px-6 py-4 gap-3">
          {/* Account */}
          <Pressable
            onPress={onNavigateToProfile}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-row items-center gap-3 active:bg-white/10"
          >
            <View className="w-10 h-10 bg-white/10 rounded-lg items-center justify-center">
              <AccountIconSvg width={20} height={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white text-sm mb-1">
                Account
              </Text>
              <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/60 text-xs">
                Manage your profile information
              </Text>
            </View>
          </Pressable>

          {/* Leaderboard */}
          <Pressable
            onPress={onNavigateToLeaderboard}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-row items-center gap-3 active:bg-white/10"
          >
            <View className="w-10 h-10 bg-white/10 rounded-lg items-center justify-center">
              <LeaderboardIconSvg width={20} height={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white text-sm mb-1">
                Leaderboard
              </Text>
              <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/60 text-xs">
                Check top winners and rankings
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Disconnect Button */}
        <View className="px-6 py-4" style={{ paddingBottom: Math.max(24, insets.bottom) }}>
          <Pressable
            onPress={handleDisconnect}
            className="bg-red-500/20 border border-red-500/50 p-4 rounded-2xl items-center"
          >
            <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-red-500 text-sm">
              Disconnect Wallet
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* QR Code Bottom Sheet */}
      <QRCodeBottomSheet isOpen={showQRCode} onOpenChange={setShowQRCode} address={address} />
    </View>
  )
}

export const SettingsScreen = React.memo(SettingsScreenComponent)
SettingsScreen.displayName = 'SettingsScreen'
