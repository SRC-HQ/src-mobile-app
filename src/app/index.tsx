import { useEffect, useRef } from 'react'
import { useRouter } from 'expo-router'
import { storageService } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'
import SplashScreen from '../screens/SplashScreen/SplashScreen'

export default function App() {
  const router = useRouter()
  const hasNavigated = useRef(false)

  useEffect(() => {
    const init = async () => {
      if (hasNavigated.current) return

      // Wait for splash animation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Check if user has connected wallet before
      const savedWalletAddress = await storageService.getItem(STORAGE_KEYS.WALLET_ADDRESS)

      hasNavigated.current = true

      // Navigate to home if wallet was previously connected, otherwise to login
      router.replace(savedWalletAddress ? '/home' : '/login')
    }

    init()
  }, [router])

  return <SplashScreen />
}
