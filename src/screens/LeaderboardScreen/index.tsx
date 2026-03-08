import React, { useMemo } from 'react'
import { View, Text, Pressable, ScrollView, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AvatarDefaultIcon, SolColorIconSvg } from '../../components/svgs'
import { useLeaderboard } from '../../hooks/useLeaderboard'
import { LeaderboardSkeleton } from '../../components/LoadingSkeleton'

interface LeaderboardScreenProps {
  onBack: () => void
}

interface LeaderboardEntry {
  rank: number
  user_address: string
  total_winning_amount: string
  username?: string
  image?: string
}

const LAMPORTS_PER_SOL = 1_000_000_000

const LeaderboardScreenComponent = ({ onBack }: LeaderboardScreenProps) => {
  const insets = useSafeAreaInsets()
  const { data: entries = [], isLoading, error } = useLeaderboard()

  const displayRows = useMemo(() => {
    const filled = [...entries]
    while (filled.length < 10) {
      const rank = filled.length + 1
      filled.push({
        rank,
        user_address: '',
        total_winning_amount: '0',
      })
    }
    return filled.slice(0, 10)
  }, [entries])

  return (
    <View className="flex-1 bg-[#0a0b0d]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4 border-b border-white/10">
        <View className="flex-row items-center">
          <Pressable
            onPress={onBack}
            className="w-10 h-10 items-center justify-center mr-2 rounded-lg active:bg-white/10"
          >
            <Text className="text-white text-2xl">←</Text>
          </Pressable>
          <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-white text-xl">
            Leaderboard
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View className="px-6 py-4">
          <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/60 text-xs mb-6">
            Top 10 winners based on total distribution winnings.
          </Text>

          {/* Header Titles */}
          <View className="flex-row items-center px-4 mb-3">
            <Text
              style={{ fontFamily: 'SpaceMono_700Bold' }}
              className="text-white/60 text-[10px] uppercase tracking-wider w-10"
            >
              Rank
            </Text>
            <Text
              style={{ fontFamily: 'SpaceMono_700Bold' }}
              className="text-white/60 text-[10px] uppercase tracking-wider flex-1 ml-3"
            >
              User
            </Text>
            <Text
              style={{ fontFamily: 'SpaceMono_700Bold' }}
              className="text-white/60 text-[10px] uppercase tracking-wider text-right"
            >
              Total Winning
            </Text>
          </View>

          {isLoading ? (
            <LeaderboardSkeleton />
          ) : error ? (
            <View className="items-center justify-center py-12">
              <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-red-400 text-sm text-center mb-2">
                Failed to load leaderboard
              </Text>
              <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/40 text-xs text-center">
                {error instanceof Error ? error.message : 'Unknown error'}
              </Text>
            </View>
          ) : entries.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/60 text-sm text-center">
                No leaderboard data yet
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {displayRows.map((row) => (
                <LeaderboardCard key={row.rank} row={row} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export const LeaderboardScreen = React.memo(LeaderboardScreenComponent)
LeaderboardScreen.displayName = 'LeaderboardScreen'

const LeaderboardCardComponent = ({ row }: LeaderboardCardProps) => {
  const hasData = !!row.user_address

  const getRankBadgeStyle = () => {
    switch (row.rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-amber-500'
      case 2:
        return 'bg-gradient-to-br from-slate-200 to-slate-400'
      case 3:
        return 'bg-gradient-to-br from-amber-700 to-orange-500'
      default:
        return 'bg-white/10'
    }
  }

  const solAmount = useMemo(() => {
    if (!hasData) return '-'
    const value = Number(row.total_winning_amount || '0')
    if (!Number.isFinite(value) || value <= 0) return '-'
    return (value / LAMPORTS_PER_SOL).toFixed(4)
  }, [row.total_winning_amount, hasData])

  const displayName = useMemo(() => {
    if (!hasData) return '—'
    if (row.username && row.username.trim().length > 0) {
      return row.username
    }
    if (row.user_address) {
      return `${row.user_address.slice(0, 6)}...${row.user_address.slice(-6)}`
    }
    return 'Unknown'
  }, [hasData, row.username, row.user_address])

  return (
    <View className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <View className="flex-row items-center gap-3">
        {/* Rank Badge */}
        <View className={`w-10 h-10 rounded-full items-center justify-center ${getRankBadgeStyle()}`}>
          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-black text-sm">
            {row.rank}
          </Text>
        </View>

        {/* User Info */}
        <View className="flex-1 flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-full bg-white/10 items-center justify-center overflow-hidden">
            {hasData && row.image ? (
              <Image source={{ uri: row.image }} style={{ width: 48, height: 48 }} resizeMode="cover" />
            ) : (
              <AvatarDefaultIcon width={32} height={32} />
            )}
          </View>
          <View className="flex-1">
            <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white text-sm mb-1" numberOfLines={1}>
              {displayName}
            </Text>
            {hasData && row.user_address && (
              <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/40 text-xs" numberOfLines={1}>
                {`${row.user_address.slice(0, 8)}...${row.user_address.slice(-8)}`}
              </Text>
            )}
          </View>
        </View>

        {/* Winning Amount */}
        <View className="items-end">
          {hasData && solAmount !== '-' ? (
            <>
              <View className="flex-row items-center gap-1 mb-1">
                <SolColorIconSvg width={14} height={14} />
                <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white text-sm">
                  {solAmount}
                </Text>
              </View>
              <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/40 text-[10px]">
                SOL
              </Text>
            </>
          ) : (
            <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-white/30 text-xs">
              —
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

const LeaderboardCard = React.memo(LeaderboardCardComponent)
LeaderboardCard.displayName = 'LeaderboardCard'

interface LeaderboardCardProps {
  row: LeaderboardEntry
}
