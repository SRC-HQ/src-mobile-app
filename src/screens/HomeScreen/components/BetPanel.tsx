import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, TextInput, Image, Alert } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { SolColorIconSvg, MatchesIconSvg, BabyKingIconSvg, RacerIconSvg } from '../../../components/svgs'
import { useGameStore } from '../../../stores/gameStore'
import { useGameSocket } from '../../../game/hooks/useGameSocket'
import { usePhaseTimer } from '../../../game/hooks/usePhaseTimer'
import { useBetting } from '../../../hooks/useBetting'
import { useWalletBalance } from '../../../hooks/useWalletBalance'
import { useUserBets } from '../../../hooks/useUserBets'
import { formatSolAmount } from '../../../utils/format'

const racerIcons = [
  require('../../../../assets/game/images/icon_01.png'),
  require('../../../../assets/game/images/icon_02.png'),
  require('../../../../assets/game/images/icon_03.png'),
  require('../../../../assets/game/images/icon_04.png'),
  require('../../../../assets/game/images/icon_05.png'),
  require('../../../../assets/game/images/icon_06.png'),
  require('../../../../assets/game/images/icon_07.png'),
  require('../../../../assets/game/images/icon_08.png'),
  require('../../../../assets/game/images/icon_09.png'),
  require('../../../../assets/game/images/icon_10.png'),
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

const LAMPORTS_PER_SOL = 1_000_000_000

export const BetPanel = React.memo(() => {
  const { account } = useMobileWallet()
  const isConnected = !!account?.address

  // Initialize WebSocket connection
  useGameSocket()

  // Get game state from store
  const { totalPot, phase, roundId } = useGameStore()
  const countdown = usePhaseTimer()

  // Betting hooks
  const { babyKingTotal, placeBet, loading: bettingLoading } = useBetting()
  const { balance, refetch: refetchBalance } = useWalletBalance()
  const { data: userBets, refetch: refetchUserBets } = useUserBets(roundId, isConnected)

  const [betMode, setBetMode] = useState<'manual' | 'auto'>('manual')
  const [selectedRacers, setSelectedRacers] = useState<number[]>([])
  const [betAmount, setBetAmount] = useState<string>('')
  const [autoMatches, setAutoMatches] = useState<string>('')

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Calculate user's total entry
  const userTotalEntry = useMemo(() => {
    if (!userBets?.total_bet) return '0'
    return formatSolAmount(parseInt(userBets.total_bet) / LAMPORTS_PER_SOL)
  }, [userBets])

  // Format prize pool
  const prizePoolFormatted = useMemo(() => {
    return formatSolAmount(parseInt(totalPot || '0') / 1e9)
  }, [totalPot])

  const toggleRacer = useCallback((index: number) => {
    setSelectedRacers((prev) => (prev.includes(index) ? prev.filter((r) => r !== index) : [...prev, index]))
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelectedRacers((prev) => (prev.length === 10 ? [] : Array.from({ length: 10 }, (_, i) => i)))
  }, [])

  const totalAmount = useMemo(() => {
    const amount = parseFloat(betAmount || '0')
    const matches = betMode === 'auto' ? parseInt(autoMatches || '0') : 1
    return (amount * matches * selectedRacers.length).toFixed(2)
  }, [betAmount, betMode, autoMatches, selectedRacers.length])

  const totalPerMatch = useMemo(() => {
    return (parseFloat(betAmount || '0') * selectedRacers.length).toFixed(2)
  }, [betAmount, selectedRacers.length])

  // Handle submit selection
  const handleSubmitSelection = useCallback(async () => {
    if (!isConnected) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet to make a selection.')
      return
    }

    if (phase !== 'PREPARATION') {
      Alert.alert('Selection Closed', 'Selection is only available during the preparation phase.')
      return
    }

    if (selectedRacers.length === 0) {
      Alert.alert('No Racers Selected', 'Please select at least one racer.')
      return
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.')
      return
    }

    // Check if user has enough balance
    if (balance !== null && balance !== undefined) {
      const totalCost = parseFloat(totalAmount) * LAMPORTS_PER_SOL
      if (totalCost > balance) {
        Alert.alert('Insufficient Balance', 'You do not have enough SOL for this selection.')
        return
      }
    }

    try {
      const signature = await placeBet(roundId, new Set(selectedRacers), parseFloat(betAmount))

      Alert.alert('Selection Submitted!', `Transaction: ${signature.slice(0, 8)}...${signature.slice(-8)}`, [
        { text: 'OK' },
      ])

      // Reset form
      setSelectedRacers([])
      setBetAmount('')
      setAutoMatches('')

      // Refetch balance and user entries
      refetchBalance()
      refetchUserBets()
    } catch (err: any) {
      console.error('[BetPanel] Submit selection error:', err)
      Alert.alert('Submission Failed', err.message || 'Failed to submit selection. Please try again.')
    }
  }, [
    isConnected,
    phase,
    selectedRacers,
    betAmount,
    balance,
    totalAmount,
    placeBet,
    roundId,
    refetchBalance,
    refetchUserBets,
  ])

  return (
    <ScrollView className="flex-1 bg-[#0a0b0d]" contentContainerStyle={{ padding: 16 }}>
      {/* Top Stats Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        {/* Baby King */}
        <View className="flex-1 min-w-[45%] min-h-[80px] rounded-lg border border-white/10 bg-white/5 p-3 items-center justify-center">
          <View className="flex-row items-center gap-2 mb-1">
            <BabyKingIconSvg width={18} height={20} />
            <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-base text-white">
              {babyKingTotal !== null ? formatSolAmount(Number(babyKingTotal) / LAMPORTS_PER_SOL) : '0'}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-xs tracking-wider text-white/60">
            Baby King
          </Text>
        </View>

        {/* Time Remaining */}
        <View className="flex-1 min-w-[45%] min-h-[80px] rounded-lg border border-white/10 bg-white/5 p-3 items-center justify-center">
          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-base text-white mb-1">
            {formatTime(countdown)}
          </Text>
          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-xs tracking-wider text-white/60">
            Time Remaining
          </Text>
        </View>

        {/* Prize Pool */}
        <View className="flex-1 min-w-[45%] min-h-[80px] rounded-lg border border-white/10 bg-white/5 p-3 items-center justify-center">
          <View className="flex-row items-center gap-1 mb-1">
            <SolColorIconSvg width={14} height={14} />
            <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-base text-white">
              {prizePoolFormatted}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-xs tracking-wider text-white/60">
            Prize Pool
          </Text>
        </View>

        {/* Your Entry */}
        <View className="flex-1 min-w-[45%] min-h-[80px] rounded-lg border border-white/10 bg-white/5 p-3 items-center justify-center">
          <View className="flex-row items-center gap-1 mb-1">
            {isConnected && <SolColorIconSvg width={14} height={14} />}
            <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-base text-white">
              {isConnected ? userTotalEntry : '--'}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-xs tracking-wider text-white/60">
            Your Entry
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

      {/* Selection Panel */}
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
            <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-xs text-white/60">
              {balance !== null && balance !== undefined ? (balance / LAMPORTS_PER_SOL).toFixed(4) : '0.0000'}
            </Text>
          </View>
          <View className="flex-row gap-2">
            {[1, 0.5, 0.1].map((amount) => (
              <Pressable
                key={amount}
                disabled={!isConnected}
                onPress={() => setBetAmount((prev) => (parseFloat(prev || '0') + amount).toFixed(2))}
                className="px-3 py-1.5 rounded bg-white/5 border border-white/10 items-center justify-center active:bg-white/10"
              >
                <Text
                  style={{ fontFamily: 'SpaceMono_700Bold' }}
                  className={`text-xs ${isConnected ? 'text-white' : 'text-white/40'}`}
                >
                  +{amount}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Amount Input */}
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
            editable={isConnected && phase === 'PREPARATION'}
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
                editable={isConnected && phase === 'PREPARATION'}
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
                editable={isConnected && phase === 'PREPARATION'}
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

      {/* Submit Button */}
      <Pressable
        disabled={!isConnected || phase !== 'PREPARATION' || bettingLoading || selectedRacers.length === 0}
        onPress={handleSubmitSelection}
        className={`w-full py-4 rounded-full items-center ${
          isConnected && phase === 'PREPARATION' && !bettingLoading && selectedRacers.length > 0
            ? 'bg-[#b6b0ff] active:bg-[#a5a0ef]'
            : 'bg-white/10'
        }`}
      >
        <Text
          style={{ fontFamily: 'SpaceMono_700Bold' }}
          className={`text-base ${
            isConnected && phase === 'PREPARATION' && !bettingLoading && selectedRacers.length > 0
              ? 'text-black'
              : 'text-white/40'
          }`}
        >
          {bettingLoading
            ? 'Processing...'
            : phase !== 'PREPARATION'
              ? 'Selection Closed'
              : betMode === 'manual'
                ? 'Pick Sperm'
                : 'Start Auto'}
        </Text>
      </Pressable>
    </ScrollView>
  )
})
BetPanel.displayName = 'BetPanel'
