import React, { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TextInput, Pressable, Platform, Keyboard, Animated, Alert } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useChats, useSendChat } from '../../../hooks/useChat'
import { createChatSignMessage, signatureToBase64 } from '../../../utils/wallet'
import { formatTimeAgo, prettyTruncate } from '../../../utils/format'
import { ChatSkeleton } from '../../../components/LoadingSkeleton'

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
  const { account, signMessage } = useMobileWallet()
  const isConnected = !!account?.address
  const scrollViewRef = useRef<ScrollView>(null)
  const keyboardHeight = useRef(new Animated.Value(0)).current

  const [message, setMessage] = useState('')
  const { data: messages, isLoading, error } = useChats(100)
  const sendChatMutation = useSendChat()

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: Platform.OS === 'ios' ? e.duration || 250 : 250,
          useNativeDriver: false,
        }).start()

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

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false })
    }, 100)

    return () => {
      keyboardWillShowListener.remove()
      keyboardWillHideListener.remove()
    }
  }, [keyboardHeight])

  const handleSend = useCallback(async () => {
    const text = message.trim()
    if (!text || !isConnected || !account?.address || !signMessage) return

    try {
      const address = account.address.toString()
      const timestamp = Date.now()

      // Create message to sign with fresh timestamp
      // Backend validates: signature + timestamp must be recent
      const messageToSign = createChatSignMessage(address, text, timestamp)
      const messageBytes = new TextEncoder().encode(messageToSign)

      // Sign the message - this will show wallet popup
      // This is required because backend validates signature with timestamp
      const signatureBytes = await signMessage(messageBytes)
      const signature = signatureToBase64(signatureBytes)

      // Send message with fresh signature
      await sendChatMutation.mutateAsync({
        message: text,
        address,
        signature,
        timestamp,
      })

      setMessage('')
      Keyboard.dismiss()

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    } catch (error) {
      console.error('Failed to send message:', error)

      if (error instanceof Error && (error.message.includes('cancel') || error.message.includes('reject'))) {
        // User cancelled - just dismiss, don't show error
        console.log('User cancelled message signing')
      } else {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send message')
      }
    }
  }, [message, isConnected, account, signMessage, sendChatMutation])

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: '#0a0b0d',
        marginBottom: keyboardHeight,
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {isLoading && <ChatSkeleton />}
        {error && (
          <View className="items-center justify-center py-8">
            <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-red-400 text-sm text-center">
              Failed to load messages
            </Text>
            <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-gray-500 text-xs text-center mt-2">
              {error instanceof Error ? error.message : 'Unknown error'}
            </Text>
          </View>
        )}
        {!isLoading && !error && messages && messages.length === 0 && (
          <View className="items-center justify-center py-8">
            <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-gray-500 text-sm text-center">
              No messages yet. Be the first to chat!
            </Text>
          </View>
        )}
        {!isLoading &&
          !error &&
          messages &&
          messages
            .slice()
            .reverse()
            .map((msg) => (
              <ChatBubble
                key={msg.id}
                user={prettyTruncate(msg.user_address, 10, 'mid')}
                message={msg.message}
                time={formatTimeAgo(msg.created_at)}
              />
            ))}
      </ScrollView>

      <View className="p-4 border-t border-white/10 bg-[#0a0b0d]">
        {sendChatMutation.error && (
          <View className="mb-2 p-2 bg-red-500/10 rounded">
            <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-red-400 text-xs">
              {sendChatMutation.error instanceof Error ? sendChatMutation.error.message : 'Failed to send'}
            </Text>
          </View>
        )}
        <View className="flex-row items-center gap-2">
          <TextInput
            value={message}
            onChangeText={setMessage}
            editable={isConnected && !sendChatMutation.isPending}
            placeholder={isConnected ? 'Type your message...' : 'Connect wallet to chat...'}
            placeholderTextColor="rgba(156, 163, 175, 1)"
            style={{ fontFamily: 'SpaceMono_400Regular' }}
            className={`flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-3 text-sm text-white ${
              !isConnected || sendChatMutation.isPending ? 'opacity-50' : ''
            }`}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }, 300)
            }}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            maxLength={500}
          />
          <Pressable
            onPress={handleSend}
            disabled={!isConnected || !message.trim() || sendChatMutation.isPending}
            className={`py-3 px-5 rounded-lg items-center justify-center ${
              isConnected && message.trim() && !sendChatMutation.isPending ? 'bg-[#b6b0ff]' : 'bg-white/10'
            }`}
          >
            <Text
              style={{ fontFamily: 'SpaceMono_700Bold' }}
              className={`text-sm ${
                isConnected && message.trim() && !sendChatMutation.isPending ? 'text-black' : 'text-white/50'
              }`}
            >
              {sendChatMutation.isPending ? 'Sending...' : 'Send'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  )
}

export const ChatPanel = React.memo(ChatPanelComponent)
ChatPanel.displayName = 'ChatPanel'
