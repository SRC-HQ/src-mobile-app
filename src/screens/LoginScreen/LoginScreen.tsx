import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, Alert, ToastAndroid, Platform, Image, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { storageService } from '../../services/storage'
import { STORAGE_KEYS } from '../../utils/constants'

export default function LoginScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const wallet = useMobileWallet()

  console.log('LoginScreen render - wallet:', wallet)

  const showToast = useCallback((message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT)
    } else {
      Alert.alert('', message)
    }
  }, [])

  const handleSuccessfulConnection = useCallback(async () => {
    try {
      if (wallet?.account?.address) {
        await storageService.setItem(STORAGE_KEYS.WALLET_ADDRESS, wallet.account.address.toString())
        showToast('Wallet connected successfully!')
        setLoading(false)
        router.replace('/home')
      }
    } catch (error) {
      console.error('Save wallet error:', error)
      showToast('Failed to save wallet address')
      setLoading(false)
    }
  }, [wallet?.account, router, showToast])

  // Monitor account changes after connection
  useEffect(() => {
    if (wallet?.account?.address && loading) {
      handleSuccessfulConnection()
    }
  }, [wallet?.account, loading, handleSuccessfulConnection])

  const handleConnectWallet = async () => {
    console.log('=== handleConnectWallet called ===')

    if (!wallet?.connect) {
      console.error('Wallet connect function not available')
      showToast('Wallet not initialized. Please restart the app.')
      return
    }

    try {
      setLoading(true)
      console.log('Calling wallet.connect()...')
      const result = await wallet.connect()
      console.log('Connect result:', result)

      // If connect returns immediately without account, wait for useEffect
      if (!result || !wallet?.account?.address) {
        console.log('Waiting for wallet approval...')
      }
    } catch (error: any) {
      console.error('Connect wallet error:', error)

      // Handle user cancellation
      if (error?.message?.includes('cancel') || error?.message?.includes('reject')) {
        showToast('Wallet connection cancelled')
      } else {
        showToast('Failed to connect wallet. Please try again.')
      }

      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 px-6 justify-center items-center">
        {/* Logo */}
        <View className="items-center mb-12">
          <Image
            source={require('../../../assets/src-logo.png')}
            style={{ width: 182, height: 182 }}
            resizeMode="contain"
          />
          <Text
            style={{ fontFamily: 'Orbitron_700Bold' }}
            className="text-white text-2xl uppercase tracking-wider mt-6"
          >
            Sperm Race Club
          </Text>
        </View>

        {/* Connect Button - Using Pressable directly for testing */}
        <Pressable
          onPress={() => {
            console.log('=== BUTTON PRESSED ===')
            handleConnectWallet()
          }}
          onPressIn={() => console.log('=== BUTTON PRESS IN ===')}
          onPressOut={() => console.log('=== BUTTON PRESS OUT ===')}
          disabled={loading}
          style={({ pressed }) => ({
            width: '100%',
            paddingVertical: 16,
            paddingHorizontal: 24,
            backgroundColor: loading ? '#8b85d1' : pressed ? '#9d97e6' : '#b6b0ff',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          })}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={{ fontFamily: 'SpaceMono_700Bold', color: '#000000', fontSize: 16 }}>Connect Wallet</Text>
          )}
        </Pressable>

        {/* Terms */}
        <Text style={{ fontFamily: 'SpaceMono_400Regular' }} className="text-xs text-secondary text-center">
          By connecting, you agree to our Terms of Service
        </Text>
      </View>
    </View>
  )
}
