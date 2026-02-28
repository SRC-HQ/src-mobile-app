import React from 'react'
import { View, Text, ScrollView, Image, ImageSourcePropType } from 'react-native'
import SolColorIconSvg from '../../../components/svgs/SolColorIconSvg'
import { useGameHistory, type HistoryRow } from '../../../hooks/useGameHistory'
import { GameHistorySkeleton } from '../../../components/LoadingSkeleton'

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

const HistoryCard = React.memo(({ item }: { item: HistoryRow }) => (
  <View className="bg-[#13141a] rounded-lg mb-2 p-3 border border-white/5">
    {/* Header Row: Race, Block, Time */}
    <View className="flex-row items-center justify-between mb-2">
      <View className="flex-row items-center gap-2">
        <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-white text-sm">
          {item.race}
        </Text>
        <View className="h-3 w-px bg-white/20" />
        <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-gray-500 text-xs">
          {item.block}
        </Text>
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
))
HistoryCard.displayName = 'HistoryCard'

export const GameHistory = React.memo(() => {
  const { data: history, isLoading } = useGameHistory()

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-[#0a0b0d]">
        <GameHistorySkeleton />
      </ScrollView>
    )
  }

  return (
    <ScrollView className="flex-1 bg-[#0a0b0d] px-3 py-2">
      {history?.map((item) => (
        <HistoryCard key={item.id} item={item} />
      ))}
    </ScrollView>
  )
})
GameHistory.displayName = 'GameHistory'
