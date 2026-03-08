import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useToast } from 'heroui-native'
import { Navbar, GameCanvas, BetPanel, GameHistory, ChatPanel, BottomTabs } from './components'
import { ClaimBottomSheet } from './components/ClaimBottomSheet'
import { SettingsScreen } from '../SettingsScreen'
import { ProfileScreen } from '../ProfileScreen'
import { LeaderboardScreen } from '../LeaderboardScreen'
import { useDistributionHistory } from '../../hooks/useDistributionHistory'
import { useClaim } from '../../hooks/useClaim'
import { showClaimSuccessToast, showClaimErrorToast } from '../../utils/toast'
import { formatSolAmount } from '../../utils/format'

type TabType = 'pick' | 'history' | 'chat'
type ScreenType = 'home' | 'settings' | 'profile' | 'leaderboard'

export const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pick')
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home')
  const [isClaimBottomSheetOpen, setIsClaimBottomSheetOpen] = useState(false)
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { account } = useMobileWallet()
  const { data: distributionData, refetch: refetchDistribution } = useDistributionHistory()
  const { claimWinnings, loading: isClaiming } = useClaim()
  const { toast } = useToast()

  // Check if user is still connected, redirect to login if not
  useEffect(() => {
    if (!account?.address) {
      router.replace('/login')
    }
  }, [account, router])

  // Memoize callbacks untuk menghindari re-render
  const handleNavigateToProfile = useCallback(() => setActiveScreen('profile'), [])
  const handleNavigateToLeaderboard = useCallback(() => setActiveScreen('leaderboard'), [])
  const handleCloseSettings = useCallback(() => setActiveScreen('home'), [])
  const handleBackToSettings = useCallback(() => setActiveScreen('settings'), [])
  const handleOpenSettings = useCallback(() => setActiveScreen('settings'), [])
  const handleOpenClaim = useCallback(() => setIsClaimBottomSheetOpen(true), [])

  // Handle claim winnings
  const handleClaim = useCallback(async () => {
    if (!account?.address || !distributionData?.records.length) return

    try {
      console.log('Claiming winnings for:', account.address)
      console.log('Total amount:', distributionData.totalWinningAmount)
      console.log('Records:', distributionData.records)

      // Call smart contract to claim winnings
      const signature = await claimWinnings(distributionData.records)

      // Calculate total amount in SOL
      const LAMPORTS_PER_SOL = 1_000_000_000
      const totalInSol = Number(distributionData.totalWinningAmount) / LAMPORTS_PER_SOL
      const formattedAmount = formatSolAmount(totalInSol)

      // Show success toast with transaction link
      showClaimSuccessToast(toast, signature, formattedAmount)

      // After successful claim, refetch distribution data
      await refetchDistribution()
      setIsClaimBottomSheetOpen(false)
    } catch (error) {
      console.error('Failed to claim winnings:', error)
      const errorMessage = error instanceof Error ? error.message : undefined
      showClaimErrorToast(toast, errorMessage)
    }
  }, [account, distributionData, claimWinnings, refetchDistribution, toast])

  // Render different screens based on activeScreen
  if (activeScreen === 'settings') {
    return (
      <SettingsScreen
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateToLeaderboard={handleNavigateToLeaderboard}
        onClose={handleCloseSettings}
      />
    )
  }

  if (activeScreen === 'profile') {
    return <ProfileScreen onBack={handleBackToSettings} />
  }

  if (activeScreen === 'leaderboard') {
    return <LeaderboardScreen onBack={handleBackToSettings} />
  }

  return (
    <View className="flex-1 bg-[#0a0b0d]">
      {/* Navbar - Full Width with Safe Area */}
      <View style={{ paddingTop: insets.top }}>
        <Navbar
          leftInset={insets.left}
          rightInset={insets.right}
          onOpenSettings={handleOpenSettings}
          onOpenClaim={handleOpenClaim}
        />
      </View>

      {/* Main Content - Below Navbar */}
      <View className="flex-1">
        {/* Game Canvas - Always mounted, never unmounts */}
        <View className="h-64">
          <GameCanvas />
        </View>

        {/* Content Area with Tabs - All panels stay mounted, only visibility changes */}
        <View className="flex-1">
          <View style={{ display: activeTab === 'pick' ? 'flex' : 'none' }} className="flex-1">
            <BetPanel />
          </View>
          <View style={{ display: activeTab === 'history' ? 'flex' : 'none' }} className="flex-1">
            <GameHistory />
          </View>
          <View style={{ display: activeTab === 'chat' ? 'flex' : 'none' }} className="flex-1">
            <ChatPanel />
          </View>
        </View>

        {/* Bottom Tabs */}
        <View style={{ paddingBottom: insets.bottom }}>
          <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </View>
      </View>

      {/* Claim Bottom Sheet */}
      <ClaimBottomSheet
        isOpen={isClaimBottomSheetOpen}
        onOpenChange={setIsClaimBottomSheetOpen}
        records={distributionData?.records || []}
        totalWinningAmount={distributionData?.totalWinningAmount || '0'}
        onClaim={handleClaim}
        isClaiming={isClaiming}
      />
    </View>
  )
}
