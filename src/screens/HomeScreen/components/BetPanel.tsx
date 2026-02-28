import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, TextInput, Image } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { SolColorIconSvg, MatchesIconSvg, BabyKingIconSvg, RacerIconSvg } from '../../../components/svgs'

const racerIcons = [
  require('../../../../assets/game/racer/icon/icon_01.png'),
  require('../../../../assets/game/racer/icon/icon_02.png'),
  require('../../../../assets/game/racer/icon/icon_03.png'),
  require('../../../../assets/game/racer/icon/icon_04.png'),
  require('../../../../assets/game/racer/icon/icon_05.png'),
  require('../../../../assets/game/racer/icon/icon_06.png'),
  require('../../../../assets/game/racer/icon/icon_07.png'),
  require('../../../../assets/game/racer/icon/icon_08.png'),
  require('../../../../assets/game/racer/icon/icon_09.png'),
  require('../../../../assets/game/racer/icon/icon_10.png'),
]

const RacerIcon = React.memo(
  ({ index, isSelected, onPress }: { index: number; isSelected: boolean; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      className={`w-16 h-16 items-center justify-center ${isSelected ? 'scale-110' : 'opacity-60'}`}
    >
      <Image source={racerIcons[index]} style={{ width: 56, height: 56 }} resizeMode="contain" />
    </Pressable>
  ),
)
RacerIcon.displayName = 'RacerIcon'

export const BetPanel = React.memo(() => {
  const { account } = useMobileWallet()
  const isConnected = !!account?.address

  const [betMode, setBetMode] = useState<'manual' | 'auto'>('manual')
  const [selectedRacers, setSelectedRacers] = useState<number[]>([])
  const [betAmount, setBetAmount] = useState<string>('')
  const [autoMatches, setAutoMatches] = useState<string>('')

  const toggleRacer = useCallback((index: number) => {
    setSelectedRacers((prev) => (prev.includes(index) ? prev.filter((r) => r !== index) : [...prev, index]))
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelectedRacers((prev) => (prev.length === 10 ? [] : Array.from({ length: 10 }, (_, i) => i)))
  }, [])

  const totalAmount = useMemo(() => {
    const bet = parseFloat(betAmount || '0')
    const matches = betMode === 'auto' ? parseInt(autoMatches || '0') : 1
    return (bet * matches * selectedRacers.length).toFixed(2)
  }, [betAmount, betMode, autoMatches, selectedRacers.length])

  const totalPerMatch = useMemo(() => {
    return (parseFloat(betAmount || '0') * selectedRacers.length).toFixed(2)
  }, [betAmount, selectedRacers.length])

  return (
    <ScrollView className="flex-1 bg-[#0a0b0d]" contentContainerStyle={{ padding: 16 }}>
      {/* Top Stats Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        {/* Baby King */}
        <View className="flex-1 min-w-[45%] min-h-[80px] rounded-lg border border-white/10 bg-white/5 p-3 items-center justify-center">
          <View className="flex-row items-center gap-2 mb-1">
            <BabyKingIconSvg width={18} height={20} />
            <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-base text-white">
              0.0000
            </Text>
          </View>
          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-xs tracking-wider text-white/60">
            Baby King
          </Text>
        </View>

        {/* Time Remaining */}
        <View className="flex-1 min-w-[45%] min-h-[80px] rounded-lg border border-white/10 bg-white/5 p-3 items-center justify-center">
          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-base text-white mb-1">
            00:00
          </Text>
          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-xs tracking-wider text-white/60">
            Time Remaining
          </Text>
        </View>

        {/* Prize Pool */}
        <View className="flex-1 min-w-[45%] min-h-[80px] rounded-lg border border-white/10 bg-white/5 p-3 items-center justify-center">
          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-base text-white mb-1">
            0.0000 SOL
          </Text>
          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-xs tracking-wider text-white/60">
            Prize Pool
          </Text>
        </View>

        {/* Your Bet */}
        <View className="flex-1 min-w-[45%] min-h-[80px] rounded-lg border border-white/10 bg-white/5 p-3 items-center justify-center">
          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-base text-white mb-1">
            {isConnected ? '0.0000 SOL' : '--'}
          </Text>
          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-xs tracking-wider text-white/60">
            Your Pot
          </Text>
        </View>
      </View>

      {/* Select Your Racer */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-sm tracking-wider text-white">
            Select Your Racer
          </Text>
          <Pressable onPress={toggleSelectAll} className="flex-row items-center gap-2" hitSlop={8}>
            <View
              className={`w-4 h-4 rounded border-2 items-center justify-center ${
                selectedRacers.length === 10 ? 'border-[#b6b0ff] bg-[#b6b0ff]/20' : 'border-white/40'
              }`}
            >
              {selectedRacers.length === 10 && <View className="w-2 h-2 rounded bg-[#b6b0ff]" />}
            </View>
            <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-xs text-white/60">
              Select All
            </Text>
          </Pressable>
        </View>

        <View className="flex-row flex-wrap gap-3 justify-center">
          {Array.from({ length: 10 }, (_, i) => (
            <RacerIcon key={i} index={i} isSelected={selectedRacers.includes(i)} onPress={() => toggleRacer(i)} />
          ))}
        </View>
      </View>

      {/* Betting Panel */}
      <View className="rounded-lg border border-white/10 bg-white/5 p-4 mb-4">
        {/* Tabs */}
        <View className="flex-row bg-black/20 rounded-lg p-1 mb-4">
          <Pressable
            onPress={() => setBetMode('manual')}
            className={`flex-1 py-2 rounded-md items-center ${betMode === 'manual' ? 'bg-white/10' : ''}`}
          >
            <Text
              style={{ fontFamily: 'SpaceMono_700Bold' }}
              className={`text-sm ${betMode === 'manual' ? 'text-white' : 'text-white/40'}`}
            >
              Manual
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setBetMode('auto')}
            className={`flex-1 py-2 rounded-md items-center ${betMode === 'auto' ? 'bg-white/10' : ''}`}
          >
            <Text
              style={{ fontFamily: 'SpaceMono_700Bold' }}
              className={`text-sm ${betMode === 'auto' ? 'text-white' : 'text-white/40'}`}
            >
              Auto
            </Text>
          </Pressable>
        </View>

        {/* Wallet Balance & Quick Amount */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-2">
            <SolColorIconSvg width={12} height={10} />
            {/* TODO: must be implement to get balance wallet current user later */}
            <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-xs text-white/60">
              0.0000
            </Text>
          </View>
          <View className="flex-row gap-2">
            {[1, 0.5, 0.1].map((amount) => (
              <Pressable
                key={amount}
                disabled={!isConnected}
                className="px-3 py-1.5 rounded bg-white/5 border border-white/10 items-center justify-center"
              >
                <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-xs text-white">
                  +{amount}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Bet Amount Input */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <SolColorIconSvg width={20} height={18} />
            <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white">
              SOL
            </Text>
          </View>
          <TextInput
            value={betAmount}
            onChangeText={setBetAmount}
            editable={isConnected}
            placeholder="1.0"
            placeholderTextColor="rgba(255,255,255,0.2)"
            keyboardType="decimal-pad"
            style={{ fontFamily: 'SpaceMono_700Bold' }}
            className="text-right text-2xl text-white/90 flex-1 ml-4"
          />
        </View>

        {/* Auto Mode: Matches Input */}
        {betMode === 'auto' && (
          <View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <RacerIconSvg width={20} height={20} />
                <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white">
                  Racers
                </Text>
              </View>
              <TextInput
                value={autoMatches}
                onChangeText={setAutoMatches}
                editable={isConnected}
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="number-pad"
                style={{ fontFamily: 'SpaceMono_700Bold' }}
                className="text-right text-2xl text-white/90 flex-1 ml-4"
              />
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MatchesIconSvg width={20} height={20} />
                <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white">
                  Matches
                </Text>
              </View>
              <TextInput
                value={autoMatches}
                onChangeText={setAutoMatches}
                editable={isConnected}
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="number-pad"
                style={{ fontFamily: 'SpaceMono_700Bold' }}
                className="text-right text-2xl text-white/90 flex-1 ml-4"
              />
            </View>
          </View>
        )}
      </View>

      {/* Footer Summary */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-sm text-white/40">
            Racers
          </Text>
          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white">
            x{selectedRacers.length}
          </Text>
        </View>

        {betMode === 'auto' && (
          <View className="flex-row justify-between items-center mb-2">
            <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-sm text-white/40">
              Total per match
            </Text>
            <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white">
              {totalPerMatch} SOL
            </Text>
          </View>
        )}

        <View className="flex-row justify-between items-center">
          <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-sm text-white/40">
            Total
          </Text>
          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-[#b6b0ff] text-base">
            {totalAmount} SOL
          </Text>
        </View>
      </View>

      {/* Place Bet Button */}
      <Pressable
        disabled={!isConnected}
        className={`w-full py-4 rounded-full items-center ${isConnected ? 'bg-[#b6b0ff]' : 'bg-white/10'}`}
      >
        <Text
          style={{ fontFamily: 'SpaceMono_700Bold' }}
          className={`text-base ${isConnected ? 'text-black' : 'text-white/40'}`}
        >
          {betMode === 'manual' ? 'Pick Sperm' : 'Start Auto'}
        </Text>
      </Pressable>
    </ScrollView>
  )
})
BetPanel.displayName = 'BetPanel'
