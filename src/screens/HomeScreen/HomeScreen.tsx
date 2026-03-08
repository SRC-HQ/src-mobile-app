import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { Navbar, GameCanvas, BetPanel, GameHistory, ChatPanel, BottomTabs } from './components'
import { SettingsScreen } from '../SettingsScreen'
import { ProfileScreen } from '../ProfileScreen'
import { LeaderboardScreen } from '../LeaderboardScreen'

type TabType = 'pick' | 'history' | 'chat'
type ScreenType = 'home' | 'settings' | 'profile' | 'leaderboard'

export const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pick')
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home')
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { account } = useMobileWallet()

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
        <Navbar leftInset={insets.left} rightInset={insets.right} onOpenSettings={handleOpenSettings} />
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
    </View>
  )
}
