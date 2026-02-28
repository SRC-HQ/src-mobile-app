import React, { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TextInput, Pressable, Platform, Keyboard, Animated } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'

interface ChatMessage {
  id: string
  user: string
  message: string
  time: string
}

const ChatBubble = React.memo(({ user, message, time }: { user: string; message: string; time: string }) => (
  <View className="mb-4">
    <View className="flex-row">
      <View className="w-8 h-8 rounded-full bg-gray-600 mr-3" />
      <View className="flex-1">
        <View className="flex-row justify-between items-baseline mb-0.5">
          <Text style={{ fontFamily: 'SpaceMono_700Bold' }} className="text-xs text-gray-400">
            {user}
          </Text>
          <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-[10px] text-gray-500">
            {time}
          </Text>
        </View>
        <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-xs text-white leading-relaxed">
          {message}
        </Text>
      </View>
    </View>
  </View>
))

ChatBubble.displayName = 'ChatBubble'

const ChatPanelComponent = () => {
  const { account } = useMobileWallet()
  const isConnected = !!account?.address
  const scrollViewRef = useRef<ScrollView>(null)
  const keyboardHeight = useRef(new Animated.Value(0)).current

  const [message, setMessage] = useState('')
  const [messages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'CryptoKing',
      message: 'Good luck everyone! 🎮',
      time: '2h ago',
    },
    {
      id: '2',
      user: 'SpermRacer',
      message: "Let's go! I'm betting on #3 this round, feeling lucky today!",
      time: '1h ago',
    },
    {
      id: '3',
      user: 'MoonShot',
      message: 'Anyone else going all in? 🚀',
      time: '1h ago',
    },
    {
      id: '4',
      user: 'DiamondHands',
      message: 'This is intense! The last race was crazy, I almost won but #7 came from behind 💎',
      time: '55m ago',
    },
    {
      id: '5',
      user: 'RaceChamp',
      message: 'GG to the winners last round!',
      time: '50m ago',
    },
    {
      id: '6',
      user: 'LuckySperm',
      message: 'My sperm is gonna win this time 😎',
      time: '45m ago',
    },
    {
      id: '7',
      user: 'BabyKingFan',
      message: 'Baby King hit incoming! 👑',
      time: '40m ago',
    },
    {
      id: '8',
      user: 'SOLWarrior',
      message: 'Just placed 5 SOL on #7! This is my biggest bet yet, wish me luck guys!',
      time: '35m ago',
    },
    {
      id: '9',
      user: 'RocketMan',
      message: 'To the moon! 🌙',
      time: '30m ago',
    },
    {
      id: '10',
      user: 'WhaleAlert',
      message: 'Someone just bet 50 SOL! 🐋',
      time: '28m ago',
    },
    {
      id: '11',
      user: 'SpeedDemon',
      message: "I've been tracking the stats and #3 has the best win rate this week",
      time: '25m ago',
    },
    {
      id: '12',
      user: 'GamingPro',
      message: 'This game is addictive! 🎯',
      time: '22m ago',
    },
    {
      id: '13',
      user: 'CryptoNinja',
      message: 'Anyone know when the next race starts?',
      time: '20m ago',
    },
    {
      id: '14',
      user: 'BetMaster',
      message: 'I won 3 races in a row yesterday! The strategy is to always bet on the underdog',
      time: '18m ago',
    },
    {
      id: '15',
      user: 'SolanaFan',
      message: 'Love this game! Best thing on Solana 💜',
      time: '15m ago',
    },
    {
      id: '16',
      user: 'RaceKing',
      message: 'LFG! 🔥',
      time: '12m ago',
    },
    {
      id: '17',
      user: 'TokenHolder',
      message: 'Just joined! How does the Baby King bonus work exactly?',
      time: '10m ago',
    },
    {
      id: '18',
      user: 'VeteranPlayer',
      message: 'Baby King gives you extra rewards if you hit it. It is random but worth it!',
      time: '9m ago',
    },
    {
      id: '19',
      user: 'NewbieBetter',
      message: 'Thanks for explaining! Placing my first bet now 🎲',
      time: '8m ago',
    },
    {
      id: '20',
      user: 'ProGamer',
      message: '#5 looking strong today',
      time: '6m ago',
    },
    {
      id: '21',
      user: 'LuckyCharm',
      message: 'I have a good feeling about this race! My lucky number is 7 and I am going all in 🍀',
      time: '5m ago',
    },
    {
      id: '22',
      user: 'WinStreak',
      message: 'On a 5 win streak! 💪',
      time: '3m ago',
    },
    {
      id: '23',
      user: 'RaceAddict',
      message: 'Cannot stop playing this game, it is so much fun and the community is awesome!',
      time: '2m ago',
    },
    {
      id: '24',
      user: 'FinalBet',
      message: 'Last bet of the day, let us make it count! 🎰',
      time: '1m ago',
    },
  ])

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: Platform.OS === 'ios' ? e.duration || 250 : 250,
          useNativeDriver: false,
        }).start()

        // Scroll to bottom when keyboard shows
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }, 100)
      },
    )

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? e.duration || 250 : 250,
          useNativeDriver: false,
        }).start()
      },
    )

    // Scroll to bottom when component mounts
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false })
    }, 100)

    return () => {
      keyboardWillShowListener.remove()
      keyboardWillHideListener.remove()
    }
  }, [keyboardHeight])

  const handleSend = useCallback(() => {
    if (!message.trim() || !isConnected) return
    // TODO: Implement send message
    setMessage('')
    // Dismiss keyboard after sending
    Keyboard.dismiss()
    // Scroll to bottom after sending
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [message, isConnected])

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: '#0a0b0d',
        marginBottom: keyboardHeight,
      }}
    >
      {/* Chat List */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.id} user={msg.user} message={msg.message} time={msg.time} />
        ))}
      </ScrollView>

      {/* Input Area */}
      <View className="p-4 border-t border-white/10 bg-[#0a0b0d]">
        <View className="flex-row items-center gap-2">
          <TextInput
            value={message}
            onChangeText={setMessage}
            editable={isConnected}
            placeholder={isConnected ? 'Type your message...' : 'Connect wallet to chat...'}
            placeholderTextColor="rgba(156, 163, 175, 1)"
            style={{ fontFamily: 'SpaceMono_400Regular' }}
            className={`flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-3 text-sm text-white ${
              !isConnected ? 'opacity-50' : ''
            }`}
            onFocus={() => {
              // Scroll to bottom when input is focused
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }, 300)
            }}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            onPress={handleSend}
            disabled={!isConnected || !message.trim()}
            className={`py-3 px-5 rounded-lg items-center justify-center ${
              isConnected && message.trim() ? 'bg-[#b6b0ff]' : 'bg-white/10'
            }`}
          >
            <Text
              style={{ fontFamily: 'SpaceMono_700Bold' }}
              className={`text-sm ${isConnected && message.trim() ? 'text-black' : 'text-white/50'}`}
            >
              Send
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  )
}

export const ChatPanel = React.memo(ChatPanelComponent)
ChatPanel.displayName = 'ChatPanel'
