import React from 'react'
import { View, Text, Pressable } from 'react-native'

type TabType = 'pick' | 'history' | 'chat'

interface BottomTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export const BottomTabs = ({ activeTab, onTabChange }: BottomTabsProps) => {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'pick', label: 'Pick' },
    { id: 'history', label: 'History' },
    { id: 'chat', label: 'Chat' },
  ]

  return (
    <View className="flex-row bg-[#0a0b0d] border-t border-white/10">
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          className={`flex-1 py-4 items-center justify-center ${
            activeTab === tab.id ? 'border-t-2 border-[#b6b0ff]' : ''
          }`}
        >
          <Text
            style={{ fontFamily: 'SpaceMono_700Bold' }}
            className={`text-sm uppercase tracking-wider ${activeTab === tab.id ? 'text-[#b6b0ff]' : 'text-white/40'}`}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}
