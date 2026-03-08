import React, { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, Alert, ToastAndroid, Platform, Image, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { storageService } from '../../services/storage'
import { authService } from '../../services/auth'
import { STORAGE_KEYS } from '../../utils/constants'
import { createAuthSignMessage, signatureToBase64 } from '../../utils/wallet'

export default function LoginScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const wallet = useMobileWallet()
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  console.log('LoginScreen render - wallet:', wallet)

  const showToast = useCallback((message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT)
    } else {
      Alert.alert('', message)
    }
  }, [])

  const handleAuthenticationFlow = useCallback(async () => {
    if (!wallet?.account?.address || !wallet?.signMessage || isProcessing) {
      console.log('Auth flow skipped - not ready:', {
        hasAccount: !!wallet?.account?.address,
        hasSignMessage: !!wallet?.signMessage,
        isProcessing,
      })
      return
    }

    // Clear connection timeout since we're proceeding with auth
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
      connectionTimeoutRef.current = null
    }

    setIsProcessing(true)

    try {
      const address = wallet.account.address.toString()

      // Add small delay to ensure wallet is fully ready
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Sign authentication message once during connection
      console.log('Requesting authentication signature...')
      const timestamp = Date.now()
      const messageToSign = createAuthSignMessage(address, timestamp)
      const messageBytes = new TextEncoder().encode(messageToSign)

      const signatureBytes = await wallet.signMessage(messageBytes)
      const signature = signatureToBase64(signatureBytes)

      // Save authentication session
      await authService.saveAuthSession({
        address,
        signature,
        timestamp,
      })

      await storageService.setItem(STORAGE_KEYS.WALLET_ADDRESS, address)
      showToast('Wallet connected successfully!')

      // Navigate to home
      router.replace('/home')
    } catch (signError: any) {
      console.error('Sign message error:', signError)

      if (
        signError?.message?.includes('cancel') ||
        signError?.message?.includes('reject') ||
        signError?.message?.includes('Cancellation')
      ) {
        showToast('Authentication cancelled')
      } else {
        showToast('Failed to authenticate. Please try again.')
      }

      // Disconnect wallet if signature fails
      if (wallet?.disconnect) {
        try {
          await wallet.disconnect()
        } catch (disconnectError) {
          console.error('Disconnect error:', disconnectError)
        }
      }
    } finally {
      setLoading(false)
      setIsProcessing(false)
    }
  }, [wallet, router, showToast, isProcessing])

  // Monitor account changes after connection
  useEffect(() => {
    // Only trigger auth flow if:
    // 1. Wallet account is available
    // 2. We're in loading state (user clicked connect)
    // 3. Not already processing
    // 4. signMessage function is available
    if (wallet?.account?.address && wallet?.signMessage && loading && !isProcessing) {
      console.log('Wallet connected, starting authentication flow...')
      console.log('Wallet state:', {
        address: wallet.account.address.toString(),
        hasSignMessage: !!wallet.signMessage,
      })
      handleAuthenticationFlow()
    }
  }, [wallet?.account?.address, wallet?.signMessage, loading, isProcessing, handleAuthenticationFlow])

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
      await wallet.connect()
      console.log('Connect initiated, waiting for wallet approval...')

      // Set timeout to reset loading state if wallet doesn't respond
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }

      connectionTimeoutRef.current = setTimeout(() => {
        if (loading && !isProcessing && !wallet?.account?.address) {
          console.log('Connection timeout - wallet not responding')
          showToast('Connection timeout. Please try again.')
          setLoading(false)
        }
      }, 30000) // 30 seconds timeout

      // The useEffect will handle the rest when wallet.account is available
    } catch (error: any) {
      console.error('Connect wallet error:', error)

      // Clear timeout on error
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }

      // Handle user cancellation
      if (error?.message?.includes('cancel') || error?.message?.includes('reject')) {
        showToast('Wallet connection cancelled')
      } else {
        showToast('Failed to connect wallet. Please try again.')
      }

      setLoading(false)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }
    }
  }, [])

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
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="#ffffff" />
              <Text style={{ fontFamily: 'SpaceMono_700Bold', color: '#ffffff', fontSize: 14 }}>
                {isProcessing ? 'Authenticating...' : 'Connecting...'}
              </Text>
            </View>
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
