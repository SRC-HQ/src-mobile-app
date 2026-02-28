import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet, Clipboard } from 'react-native'
import { BottomSheet, useBottomSheet } from 'heroui-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import QRCode from 'react-native-qrcode-svg'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const CustomOverlay = () => {
  const { isOpen, onOpenChange } = useBottomSheet()

  if (!isOpen) return null

  return (
    <AnimatedPressable
      entering={FadeIn}
      exiting={FadeOut}
      style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}
      onPress={() => onOpenChange(false)}
    />
  )
}

interface QRCodeBottomSheetProps {
  isOpen: boolean
  onOpenChange: (value: boolean) => void
  address: string
}

export const QRCodeBottomSheet = ({ isOpen, onOpenChange, address }: QRCodeBottomSheetProps) => {
  const insets = useSafeAreaInsets()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    Clipboard.setString(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <CustomOverlay />
        <BottomSheet.Content
          backgroundClassName="bg-[#1a1b1e]"
          bottomInset={insets.bottom}
          enablePanDownToClose={true}
          enableDynamicSizing={false}
          snapPoints={['100%']}
        >
          <View className="flex-1 p-6 bg-[#1a1b1e]" style={{ paddingBottom: Math.max(24, insets.bottom) }}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-8">
              <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-white text-lg">
                Scan QR Code
              </Text>
              <Pressable
                onPress={() => onOpenChange(false)}
                className="w-10 h-10 items-center justify-center rounded-lg active:bg-white/10"
              >
                <Text className="text-white/80 text-3xl leading-none">×</Text>
              </Pressable>
            </View>

            {/* QR Code Placeholder */}
            <View className="items-center justify-center flex-1">
              <View className="bg-white p-8 rounded-2xl mb-6">
                <QRCode value={address || 'No Address'} size={256} backgroundColor="white" color="black" />
              </View>

              {/* Wallet Address */}
              <View className="bg-white/5 border border-white/10 rounded-xl p-4 w-full">
                <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/60 text-xs mb-2">
                  Wallet Address
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text
                    style={{ fontFamily: 'SpaceMono_400Regular' }}
                    className="text-white text-xs flex-1"
                    numberOfLines={1}
                  >
                    {address ? `${address.slice(0, 8)}...${address.slice(-8)}` : ''}
                  </Text>
                  <Pressable onPress={handleCopy} className="ml-3 bg-white/10 px-3 py-2 rounded-lg active:bg-white/20">
                    <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white text-xs">
                      {copied ? 'Copied!' : 'Copy'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  )
}
