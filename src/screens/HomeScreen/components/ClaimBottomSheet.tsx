import React from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView, Image, ImageSourcePropType } from 'react-native'
import { BottomSheet, useBottomSheet } from 'heroui-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import type { DistributionRecord } from '../../../services/api/distribution-history'
import { formatSolAmount } from '../../../utils/format'

// Racer icons mapping (0-indexed)
const racerIcons: Record<number, ImageSourcePropType> = {
  0: require('../../../../assets/game/images/icon_01.png'),
  1: require('../../../../assets/game/images/icon_02.png'),
  2: require('../../../../assets/game/images/icon_03.png'),
  3: require('../../../../assets/game/images/icon_04.png'),
  4: require('../../../../assets/game/images/icon_05.png'),
  5: require('../../../../assets/game/images/icon_06.png'),
  6: require('../../../../assets/game/images/icon_07.png'),
  7: require('../../../../assets/game/images/icon_08.png'),
  8: require('../../../../assets/game/images/icon_09.png'),
  9: require('../../../../assets/game/images/icon_10.png'),
}

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

interface ClaimBottomSheetProps {
  isOpen: boolean
  onOpenChange: (value: boolean) => void
  records: DistributionRecord[]
  totalWinningAmount: string
  onClaim: () => void
  isClaiming?: boolean
}

const LAMPORTS_PER_SOL = 1_000_000_000

export const ClaimBottomSheet = ({
  isOpen,
  onOpenChange,
  records,
  totalWinningAmount,
  onClaim,
  isClaiming = false,
}: ClaimBottomSheetProps) => {
  const insets = useSafeAreaInsets()

  const totalInSol = Number(totalWinningAmount) / LAMPORTS_PER_SOL

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <CustomOverlay />
        <BottomSheet.Content
          backgroundClassName="bg-[#1a1b1e]"
          bottomInset={insets.bottom}
          enablePanDownToClose={true}
          enableDynamicSizing={false}
          snapPoints={['85%']}
        >
          <View className="flex-1 bg-[#1a1b1e]">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 border-b border-white/10">
              <View className="flex-row items-center justify-between mb-4">
                <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-white text-lg">
                  Claim Winnings
                </Text>
                <Pressable
                  onPress={() => onOpenChange(false)}
                  className="w-10 h-10 items-center justify-center rounded-lg active:bg-white/10"
                >
                  <Text className="text-white/80 text-3xl leading-none">×</Text>
                </Pressable>
              </View>

              {/* Total Amount */}
              <View className="bg-[#b6b0ff]/20 border border-[#b6b0ff]/30 rounded-xl p-4">
                <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/60 text-xs mb-1">
                  Total Unclaimed Winnings
                </Text>
                <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-[#b6b0ff] text-2xl">
                  {formatSolAmount(totalInSol)} SOL
                </Text>
              </View>
            </View>

            {/* Scrollable Records */}
            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
              <View className="py-4 gap-3">
                {records.map((record, index) => {
                  const betAmountSol = Number(record.bet_amount) / LAMPORTS_PER_SOL
                  const winningAmountSol = Number(record.winning_amount) / LAMPORTS_PER_SOL
                  const multiplier = betAmountSol > 0 ? winningAmountSol / betAmountSol : 0

                  return (
                    <View key={record.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      {/* Round Info */}
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-white text-sm">
                            Round #{record.round_id}
                          </Text>
                          <View className="flex-row items-center gap-1 px-2 py-1 rounded">
                            <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-[#b6b0ff] text-xs">
                              Racer:
                            </Text>
                            <Image
                              source={racerIcons[record.winning_sperm_id] || racerIcons[0]}
                              style={{ width: 16, height: 16 }}
                              resizeMode="contain"
                            />
                          </View>
                        </View>
                        <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/40 text-xs">
                          {new Date(record.created_at).toLocaleDateString()}
                        </Text>
                      </View>

                      {/* Bet and Winning Info */}
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/60 text-xs mb-1">
                            Bet Amount
                          </Text>
                          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white text-sm">
                            {formatSolAmount(betAmountSol)} SOL
                          </Text>
                        </View>
                        <View className="flex-1 items-center">
                          <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/60 text-xs mb-1">
                            Multiplier
                          </Text>
                          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-green-400 text-sm">
                            {multiplier.toFixed(2)}x
                          </Text>
                        </View>
                        <View className="flex-1 items-end">
                          <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/60 text-xs mb-1">
                            Winning
                          </Text>
                          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-[#b6b0ff] text-sm">
                            {formatSolAmount(winningAmountSol)} SOL
                          </Text>
                        </View>
                      </View>
                    </View>
                  )
                })}
              </View>
            </ScrollView>

            {/* Footer with Claim Button */}
            <View
              className="px-6 py-4 border-t border-white/10 bg-[#1a1b1e]"
              style={{ paddingBottom: Math.max(16, insets.bottom) }}
            >
              <Pressable
                onPress={onClaim}
                disabled={isClaiming || records.length === 0}
                className={`h-14 rounded-xl flex-row items-center justify-center ${
                  isClaiming || records.length === 0 ? 'bg-white/10' : 'bg-[#FFD700] active:bg-[#FFA500]'
                }`}
              >
                <Text
                  style={{ fontFamily: 'Orbitron_700Bold' }}
                  className={`text-base ${isClaiming || records.length === 0 ? 'text-white/40' : 'text-black'}`}
                >
                  {isClaiming ? 'Claiming...' : 'Claim Now'}
                </Text>
              </Pressable>
            </View>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  )
}
