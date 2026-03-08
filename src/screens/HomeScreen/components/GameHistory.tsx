import React, { useEffect, useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native'
import SolColorIconSvg from '../../../components/svgs/SolColorIconSvg'
import { useGameHistory, fetchGameHistoryPage, type HistoryRow } from '../../../hooks/useGameHistory'
import { GameHistorySkeleton } from '../../../components/LoadingSkeleton'
import { getSolscanTxUrl } from '../../../config/network'

const racerIcons: Record<number, ImageSourcePropType> = {
  0: require('../../../../assets/game/racer/icon/icon_01.png'),
  1: require('../../../../assets/game/racer/icon/icon_02.png'),
  2: require('../../../../assets/game/racer/icon/icon_03.png'),
  3: require('../../../../assets/game/racer/icon/icon_04.png'),
  4: require('../../../../assets/game/racer/icon/icon_05.png'),
  5: require('../../../../assets/game/racer/icon/icon_06.png'),
  6: require('../../../../assets/game/racer/icon/icon_07.png'),
  7: require('../../../../assets/game/racer/icon/icon_08.png'),
  8: require('../../../../assets/game/racer/icon/icon_09.png'),
  9: require('../../../../assets/game/racer/icon/icon_10.png'),
}

const HistoryCard = React.memo(({ item }: { item: HistoryRow }) => {
  const handleBlockPress = async () => {
    const url = getSolscanTxUrl(item.txHash)
    const canOpen = await Linking.canOpenURL(url)
    if (canOpen) {
      await Linking.openURL(url)
    }
  }

  return (
    <View className="bg-[#13141a] rounded-lg mb-2 p-3 border border-white/5">
      {/* Header Row: Race, Block, Time */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white text-sm">
            {item.race}
          </Text>
          <View className="h-3 w-px bg-white/20" />
          <TouchableOpacity onPress={handleBlockPress} activeOpacity={0.7}>
            <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-gray-500 text-xs underline">
              {item.block}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-gray-500 text-xs">
          {item.time}
        </Text>
      </View>

      {/* Content Grid */}
      <View className="flex-row items-center justify-between">
        {/* Winner Icon */}
        <View className="items-center">
          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-gray-400 text-[10px] mb-1">
            1st
          </Text>
          <Image source={racerIcons[item.winnerIndex]} style={{ width: 32, height: 32 }} resizeMode="contain" />
        </View>

        {/* Winners Count */}
        <View className="items-center">
          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-gray-400 text-[10px] mb-1">
            Winners
          </Text>
          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white text-sm">
            {item.winnersCount}
          </Text>
        </View>

        {/* Total Pool */}
        <View className="items-center">
          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-gray-400 text-[10px] mb-1">
            Total Pool
          </Text>
          <View className="flex-row items-center gap-1">
            <SolColorIconSvg width={14} height={14} />
            <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-[#b6b0ff] text-sm">
              {item.totalPool}
            </Text>
          </View>
        </View>

        {/* Baby King */}
        <View className="items-center">
          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-gray-400 text-[10px] mb-1">
            Baby King
          </Text>
          <View className={`px-2 py-1 rounded ${item.babyKing === 'Hit' ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
            <Text
              style={{ fontFamily: 'SpaceMono_700Bold' }}
              className={`text-xs ${item.babyKing === 'Hit' ? 'text-green-400' : 'text-gray-400'}`}
            >
              {item.babyKing}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
})
HistoryCard.displayName = 'HistoryCard'

export const GameHistory = React.memo(() => {
  const { data: initialHistory, isLoading, error } = useGameHistory()
  const [history, setHistory] = useState<HistoryRow[]>([])
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // Update local history when initial data loads
  useEffect(() => {
    if (initialHistory) {
      setHistory(initialHistory)
      setHasMore(initialHistory.length > 0)
    }
  }, [initialHistory])

  const loadMore = useCallback(() => {
    if (!hasMore || isFetchingMore || isLoading) return

    const currentLength = history.length
    if (currentLength === 0) return

    setIsFetchingMore(true)
    fetchGameHistoryPage(currentLength)
      .then((rows) => {
        setHistory((prev) => {
          // Create a Set of existing IDs to prevent duplicates
          const existingIds = new Set(prev.map((item) => item.id))
          // Filter out any rows that already exist
          const newRows = rows.filter((row) => !existingIds.has(row.id))
          // Only append if there are new unique rows
          if (newRows.length === 0) {
            return prev
          }
          return [...prev, ...newRows]
        })
        setHasMore(rows.length > 0)
      })
      .catch(() => {
        setHasMore(false)
      })
      .finally(() => {
        setIsFetchingMore(false)
      })
  }, [hasMore, isFetchingMore, isLoading, history.length])

  const handleScroll = useCallback(
    ({ nativeEvent }: any) => {
      if (!hasMore || isFetchingMore || isLoading) return

      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
      const paddingToBottom = 200 // Increased threshold for earlier trigger
      const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom

      if (isCloseToBottom) {
        loadMore()
      }
    },
    [hasMore, isFetchingMore, isLoading, loadMore],
  )

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-[#0a0b0d]">
        <GameHistorySkeleton />
      </ScrollView>
    )
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#0a0b0d] items-center justify-center px-4">
        <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-red-400 text-sm text-center">
          Failed to load game history
        </Text>
        <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-gray-500 text-xs text-center mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
      </View>
    )
  }

  if (history.length === 0) {
    return (
      <View className="flex-1 bg-[#0a0b0d] items-center justify-center px-4">
        <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-gray-500 text-sm text-center">
          No game history yet
        </Text>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-[#0a0b0d] px-3 py-2"
      onScroll={handleScroll}
      onScrollEndDrag={handleScroll}
      onMomentumScrollEnd={handleScroll}
      scrollEventThrottle={200}
    >
      {history.map((item) => (
        <HistoryCard key={item.id} item={item} />
      ))}
      {isFetchingMore && (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#b6b0ff" />
        </View>
      )}
      {!hasMore && history.length > 0 && (
        <View className="py-4 items-center">
          <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-gray-500 text-xs">
            No more history
          </Text>
        </View>
      )}
    </ScrollView>
  )
})
GameHistory.displayName = 'GameHistory'
