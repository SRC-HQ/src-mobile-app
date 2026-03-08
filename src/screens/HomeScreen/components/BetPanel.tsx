import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { View, Text, ScrollView, Pressable, TextInput, Image, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useToast } from 'heroui-native'
import { SolColorIconSvg, MatchesIconSvg, BabyKingIconSvg, RacerIconSvg } from '../../../components/svgs'
import { useGameStore } from '../../../stores/gameStore'
import { useGameSocket } from '../../../game/hooks/useGameSocket'
import { usePhaseTimer } from '../../../game/hooks/usePhaseTimer'
import { useBetting } from '../../../hooks/useBetting'
import { useWalletBalance } from '../../../hooks/useWalletBalance'
import { useUserBets } from '../../../hooks/useUserBets'
import { useRoundStatus } from '../../../hooks/useRoundStatus'
import { formatSolAmount } from '../../../utils/format'
import { showPickSpermSuccessToast, showPickSpermErrorToast } from '../../../utils/toast'

const AUTO_BET_STORAGE_KEY = '@sperm_race_auto_bet_config'

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

interface AutoBetConfig {
  racers: number[]
  amount: number
  totalMatches: number
  completedMatches: number
  skippedMatches: number // Track cancelled/skipped rounds
  startRoundId: number
  lastProcessedRoundId: number // Track last round we tried to process
}

export const BetPanel = React.memo(() => {
  const { account } = useMobileWallet()
  const isConnected = !!account?.address
  const { toast } = useToast()

  // Initialize WebSocket connection
  useGameSocket()

  // Get game state from store
  const { totalPot, phase, roundId } = useGameStore()
  const countdown = usePhaseTimer()

  // Betting hooks
  const { babyKingTotal, placeBet, loading: bettingLoading } = useBetting()
  const { balance, refetch: refetchBalance } = useWalletBalance()
  const { data: userBets, refetch: refetchUserBets } = useUserBets(roundId, isConnected)
  const { status: roundStatus } = useRoundStatus(roundId)

  const [betMode, setBetMode] = useState<'manual' | 'auto'>('manual')
  const [selectedRacers, setSelectedRacers] = useState<number[]>([])
  const [betAmount, setBetAmount] = useState<string>('')
  const [autoMatches, setAutoMatches] = useState<string>('')
  const [autoBetConfig, setAutoBetConfig] = useState<AutoBetConfig | null>(null)
  const [isAutoBetting, setIsAutoBetting] = useState(false)

  const prevRoundIdRef = useRef<number>(roundId)
  const prevPhaseRef = useRef<string>(phase)
  const autoBetInProgressRef = useRef<boolean>(false)

  // Load auto bet config from storage on mount
  useEffect(() => {
    const loadAutoBetConfig = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTO_BET_STORAGE_KEY)
        if (stored) {
          const config = JSON.parse(stored) as AutoBetConfig
          setAutoBetConfig(config)
          setIsAutoBetting(true)
          console.log('[BetPanel] Loaded auto bet config from storage:', config)
        }
      } catch (err) {
        console.error('[BetPanel] Failed to load auto bet config:', err)
      }
    }
    loadAutoBetConfig()
  }, [])

  // Save auto bet config to storage whenever it changes
  useEffect(() => {
    const saveAutoBetConfig = async () => {
      try {
        if (autoBetConfig && isAutoBetting) {
          await AsyncStorage.setItem(AUTO_BET_STORAGE_KEY, JSON.stringify(autoBetConfig))
          console.log('[BetPanel] Saved auto bet config to storage:', autoBetConfig)
        } else {
          await AsyncStorage.removeItem(AUTO_BET_STORAGE_KEY)
          console.log('[BetPanel] Removed auto bet config from storage')
        }
      } catch (err) {
        console.error('[BetPanel] Failed to save auto bet config:', err)
      }
    }
    saveAutoBetConfig()
  }, [autoBetConfig, isAutoBetting])

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

  // Auto betting effect - triggers when new round starts
  useEffect(() => {
    const executeAutoBet = async () => {
      // Prevent concurrent executions
      if (autoBetInProgressRef.current) {
        console.log('[BetPanel] Auto bet already in progress, skipping')
        return
      }

      if (!autoBetConfig || !isAutoBetting) {
        return
      }

      // Check if we've completed all matches (completed + skipped)
      const totalProcessed = autoBetConfig.completedMatches + autoBetConfig.skippedMatches
      if (totalProcessed >= autoBetConfig.totalMatches) {
        console.log('[BetPanel] Auto betting completed all matches')
        setIsAutoBetting(false)
        setAutoBetConfig(null)
        await AsyncStorage.removeItem(AUTO_BET_STORAGE_KEY)
        toast.show({
          variant: 'success',
          label: 'Auto Pick Completed',
          description: `Completed ${autoBetConfig.completedMatches}/${autoBetConfig.totalMatches} matches (${autoBetConfig.skippedMatches} skipped)`,
          duration: 5000,
        })
        return
      }

      // Detect new round (roundId increased)
      const isNewRound = roundId > prevRoundIdRef.current
      const isPreparationPhase = phase === 'PREPARATION'
      const wasNotPreparation = prevPhaseRef.current !== 'PREPARATION'

      // Check if we already processed this round
      const alreadyProcessed = roundId <= autoBetConfig.lastProcessedRoundId

      console.log('[BetPanel] Auto bet check:', {
        isNewRound,
        isPreparationPhase,
        wasNotPreparation,
        alreadyProcessed,
        currentRound: roundId,
        prevRound: prevRoundIdRef.current,
        lastProcessedRound: autoBetConfig.lastProcessedRoundId,
        currentPhase: phase,
        prevPhase: prevPhaseRef.current,
        completedMatches: autoBetConfig.completedMatches,
        skippedMatches: autoBetConfig.skippedMatches,
        totalMatches: autoBetConfig.totalMatches,
      })

      // Execute bet when entering preparation phase of a new round that hasn't been processed
      if (isNewRound && isPreparationPhase && wasNotPreparation && !alreadyProcessed) {
        console.log('[BetPanel] Executing auto bet for round', roundId)
        autoBetInProgressRef.current = true

        try {
          // Check round status
          if (roundStatus?.isLocked || roundStatus?.isResolved) {
            console.log('[BetPanel] Round is locked or resolved, skipping auto bet')
            autoBetInProgressRef.current = false
            return
          }

          // Check balance
          if (balance !== null && balance !== undefined) {
            const totalCost = autoBetConfig.amount * autoBetConfig.racers.length * LAMPORTS_PER_SOL
            if (totalCost > balance) {
              console.log('[BetPanel] Insufficient balance for auto bet')
              setIsAutoBetting(false)
              setAutoBetConfig(null)
              await AsyncStorage.removeItem(AUTO_BET_STORAGE_KEY)
              toast.show({
                variant: 'danger',
                label: 'Auto Pick Stopped',
                description: 'Insufficient balance',
                duration: 5000,
              })
              autoBetInProgressRef.current = false
              return
            }
          }

          // Place bet - this will trigger wallet signature request
          const signature = await placeBet(roundId, new Set(autoBetConfig.racers), autoBetConfig.amount)

          // Update completed matches
          const newCompletedMatches = autoBetConfig.completedMatches + 1
          const updatedConfig = {
            ...autoBetConfig,
            completedMatches: newCompletedMatches,
            lastProcessedRoundId: roundId,
          }
          setAutoBetConfig(updatedConfig)

          console.log('[BetPanel] Auto bet successful:', {
            signature,
            match: newCompletedMatches,
            total: autoBetConfig.totalMatches,
          })

          // Show success toast with transaction link
          const totalAmount = (autoBetConfig.amount * autoBetConfig.racers.length).toFixed(2)
          showPickSpermSuccessToast(toast, signature, autoBetConfig.racers, totalAmount)

          const totalProcessedAfter = newCompletedMatches + autoBetConfig.skippedMatches
          toast.show({
            variant: 'success',
            label: 'Auto Pick Success',
            description: `Match ${totalProcessedAfter}/${autoBetConfig.totalMatches} completed`,
            duration: 4000,
          })

          // Refetch data
          refetchBalance()
          refetchUserBets()
        } catch (err: any) {
          // Check if user cancelled the transaction
          const isCancelled =
            err.message?.toLowerCase().includes('declined') ||
            err.message?.toLowerCase().includes('cancelled') ||
            err.message?.toLowerCase().includes('rejected') ||
            err.message?.toLowerCase().includes('user') ||
            err.code === -3 // Solana Mobile Wallet Adapter error code for declined

          if (isCancelled) {
            // Mark this round as skipped and continue
            const newSkippedMatches = autoBetConfig.skippedMatches + 1
            const updatedConfig = {
              ...autoBetConfig,
              skippedMatches: newSkippedMatches,
              lastProcessedRoundId: roundId,
            }
            setAutoBetConfig(updatedConfig)

            const totalProcessedAfter = autoBetConfig.completedMatches + newSkippedMatches

            console.log('[BetPanel] Transaction cancelled, marked as skipped:', {
              skippedMatches: newSkippedMatches,
              totalProcessed: totalProcessedAfter,
            })
          } else {
            // Stop auto betting on other errors
            setIsAutoBetting(false)
            setAutoBetConfig(null)
            await AsyncStorage.removeItem(AUTO_BET_STORAGE_KEY)
            toast.show({
              variant: 'danger',
              label: 'Auto Pick Stopped',
              description: err.message || 'Failed to place auto bet',
              duration: 5000,
            })
          }
        } finally {
          autoBetInProgressRef.current = false
        }
      }

      // Update refs
      prevRoundIdRef.current = roundId
      prevPhaseRef.current = phase
    }

    executeAutoBet()
  }, [
    roundId,
    phase,
    autoBetConfig,
    isAutoBetting,
    roundStatus,
    balance,
    placeBet,
    refetchBalance,
    refetchUserBets,
    toast,
  ])

  // Cancel auto betting handler
  const handleCancelAutoBet = useCallback(async () => {
    setIsAutoBetting(false)
    setAutoBetConfig(null)
    await AsyncStorage.removeItem(AUTO_BET_STORAGE_KEY)
    toast.show({
      variant: 'default',
      label: 'Auto Pick Cancelled',
      description: `Completed ${autoBetConfig?.completedMatches || 0}/${autoBetConfig?.totalMatches || 0} matches (${autoBetConfig?.skippedMatches || 0} skipped)`,
      duration: 4000,
    })
  }, [autoBetConfig, toast])

  // Handle submit selection
  const handleSubmitSelection = useCallback(async () => {
    if (!isConnected) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet to make a selection.')
      return
    }

    // Check on-chain round status first
    if (roundStatus?.isLocked) {
      Alert.alert('Pick Locked', 'Betting is currently locked for this round. Please wait for the next round.')
      return
    }

    if (roundStatus?.isResolved) {
      Alert.alert('Round Ended', 'This round has already ended. Please wait for the next round.')
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

    // Auto mode validation
    if (betMode === 'auto') {
      const matches = parseInt(autoMatches || '0')
      if (matches <= 0) {
        Alert.alert('Invalid Matches', 'Please enter a valid number of matches.')
        return
      }
    }

    // Check if user has enough balance for first bet
    if (balance !== null && balance !== undefined) {
      const firstBetCost = parseFloat(betAmount) * selectedRacers.length * LAMPORTS_PER_SOL
      if (firstBetCost > balance) {
        Alert.alert('Insufficient Balance', 'You do not have enough SOL for this selection.')
        return
      }
    }

    try {
      // Place first bet immediately (both manual and auto mode)
      const signature = await placeBet(roundId, new Set(selectedRacers), parseFloat(betAmount))

      // Show success toast with transaction link
      const totalCost = (parseFloat(betAmount) * selectedRacers.length).toFixed(2)
      showPickSpermSuccessToast(toast, signature, selectedRacers, totalCost)

      if (betMode === 'manual') {
        // Manual mode: just reset form
        setSelectedRacers([])
        setBetAmount('')
      } else {
        // Auto mode: setup auto betting for remaining matches
        const matches = parseInt(autoMatches)
        setAutoBetConfig({
          racers: [...selectedRacers],
          amount: parseFloat(betAmount),
          totalMatches: matches,
          completedMatches: 1, // First match already completed
          skippedMatches: 0,
          startRoundId: roundId,
          lastProcessedRoundId: roundId, // Mark current round as processed
        })
        setIsAutoBetting(true)

        // Don't reset form in auto mode, keep the configuration visible
      }

      // Refetch balance and user entries
      refetchBalance()
      refetchUserBets()
    } catch (err: any) {
      console.error('[BetPanel] Submit selection error:', err)
      const errorMessage = err.message || 'Failed to submit selection. Please try again.'
      showPickSpermErrorToast(toast, errorMessage)
    }
  }, [
    isConnected,
    roundStatus,
    phase,
    selectedRacers,
    betAmount,
    betMode,
    autoMatches,
    balance,
    placeBet,
    roundId,
    refetchBalance,
    refetchUserBets,
    toast,
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

      {/* SKR Token Info Banner */}
      <View className="rounded-lg border border-[#b6b0ff]/30 bg-[#b6b0ff]/5 p-3 mb-6">
        <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-xs text-[#b6b0ff] mb-1">
          Coming Soon
        </Text>
        <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-xs text-white/70">
          Play with <Text className="font-bold text-white">$SKR</Text> token
        </Text>
      </View>

      {/* Select Your Racer */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-sm tracking-wider text-white">
            {isAutoBetting ? 'Selected Racers' : 'Select Your Racer'}
          </Text>
          {!isAutoBetting && (
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
          )}
        </View>

        <View className="flex-row flex-wrap gap-3 justify-center">
          {isAutoBetting && autoBetConfig
            ? // Show only selected racers when auto betting is active
              autoBetConfig.racers.map((racerIndex) => (
                <View key={racerIndex} className="w-16 h-16 items-center justify-center">
                  <Image source={racerIcons[racerIndex]} style={{ width: 56, height: 56 }} resizeMode="contain" />
                </View>
              ))
            : // Show all racers with selection when not auto betting
              Array.from({ length: 10 }, (_, i) => (
                <RacerIcon key={i} index={i} isSelected={selectedRacers.includes(i)} onPress={() => toggleRacer(i)} />
              ))}
        </View>
      </View>

      {/* Show Auto Pick Status Card when active, otherwise show Selection Panel */}
      {isAutoBetting && autoBetConfig ? (
        /* Auto Pick Active Card */
        <View className="rounded-lg border border-[#b6b0ff]/30 bg-[#b6b0ff]/10 p-4 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-lg text-white">
              Auto Pick Active
            </Text>
            <View className="w-3 h-3 rounded-full bg-[#b6b0ff] animate-pulse" />
          </View>

          {/* Progress */}
          <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-white/10">
            <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-sm text-white/60">
              Progress
            </Text>
            <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-lg text-[#b6b0ff]">
              {autoBetConfig.completedMatches + autoBetConfig.skippedMatches}/{autoBetConfig.totalMatches}
            </Text>
          </View>

          {/* Completed */}
          <View className="flex-row justify-between items-center mb-2">
            <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-sm text-white/60">
              Completed
            </Text>
            <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-green-400">
              {autoBetConfig.completedMatches}
            </Text>
          </View>

          {/* Skipped */}
          {autoBetConfig.skippedMatches > 0 && (
            <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-white/10">
              <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-sm text-white/60">
                Skipped
              </Text>
              <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-yellow-400">
                {autoBetConfig.skippedMatches}
              </Text>
            </View>
          )}

          {/* Racers */}
          <View className="flex-row justify-between items-center mb-2">
            <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-sm text-white/60">
              Racers Selected
            </Text>
            <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white">
              {autoBetConfig.racers.length} racers
            </Text>
          </View>

          {/* Amount per match */}
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-sm text-white/60">
              Amount per Match
            </Text>
            <View className="flex-row items-center gap-1">
              <SolColorIconSvg width={12} height={12} />
              <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white">
                {(autoBetConfig.amount * autoBetConfig.racers.length).toFixed(2)} SOL
              </Text>
            </View>
          </View>

          <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-xs text-white/40 mb-4">
            You will be prompted to sign each transaction in every new round
          </Text>

          {/* Cancel Button */}
          <Pressable
            onPress={handleCancelAutoBet}
            className="w-full py-3 rounded-lg bg-red-500/20 border border-red-500/40 items-center active:bg-red-500/30"
          >
            <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-sm text-red-400">
              Cancel Auto Pick
            </Text>
          </Pressable>
        </View>
      ) : (
        /* Selection Panel */
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
              editable={isConnected && phase === 'PREPARATION' && !isAutoBetting}
              placeholder="1.0"
              placeholderTextColor="rgba(255,255,255,0.2)"
              keyboardType="decimal-pad"
              style={{ fontFamily: 'SpaceMono_700Bold' }}
              className="text-right text-2xl text-white/90 flex-1 ml-4"
            />
          </View>

          {/* Auto Mode: Racers & Matches */}
          {betMode === 'auto' && (
            <View className="mt-4 pt-4 border-t border-white/10">
              {/* Racers (Read-only) */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <RacerIconSvg width={20} height={20} />
                  <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white">
                    Racers
                  </Text>
                </View>
                <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-right text-2xl text-[#b6b0ff]">
                  {selectedRacers.length}
                </Text>
              </View>
              {/* Matches Input */}
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
                  editable={isConnected && phase === 'PREPARATION' && !isAutoBetting}
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
      )}

      {/* Footer Summary - Only show when not in auto betting mode */}
      {!isAutoBetting && (
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
      )}

      {/* Submit Button - Only show when not in auto betting mode */}
      {!isAutoBetting && (
        <Pressable
          disabled={
            isAutoBetting ||
            !isConnected ||
            phase !== 'PREPARATION' ||
            bettingLoading ||
            selectedRacers.length === 0 ||
            roundStatus?.isLocked ||
            roundStatus?.isResolved
          }
          onPress={handleSubmitSelection}
          className={`w-full py-4 rounded-full items-center ${
            !isAutoBetting &&
            isConnected &&
            phase === 'PREPARATION' &&
            !bettingLoading &&
            selectedRacers.length > 0 &&
            !roundStatus?.isLocked &&
            !roundStatus?.isResolved
              ? 'bg-[#b6b0ff] active:bg-[#a5a0ef]'
              : 'bg-white/10'
          }`}
        >
          <Text
            style={{ fontFamily: 'SpaceMono_700Bold' }}
            className={`text-base ${
              !isAutoBetting &&
              isConnected &&
              phase === 'PREPARATION' &&
              !bettingLoading &&
              selectedRacers.length > 0 &&
              !roundStatus?.isLocked &&
              !roundStatus?.isResolved
                ? 'text-black'
                : 'text-white/40'
            }`}
          >
            {isAutoBetting
              ? 'Auto Pick Running...'
              : bettingLoading
                ? 'Processing...'
                : roundStatus?.isLocked
                  ? 'Pick Locked'
                  : roundStatus?.isResolved
                    ? 'Round Ended'
                    : phase !== 'PREPARATION'
                      ? 'Selection Closed'
                      : betMode === 'manual'
                        ? 'Pick Sperm'
                        : 'Pick Auto'}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  )
})
BetPanel.displayName = 'BetPanel'
