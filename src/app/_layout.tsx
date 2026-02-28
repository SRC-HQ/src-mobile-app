import '../global.css'

import { Slot } from 'expo-router'
import { MobileWalletProvider, createSolanaDevnet } from '@wallet-ui/react-native-kit'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts, Orbitron_400Regular, Orbitron_700Bold, Orbitron_900Black } from '@expo-google-fonts/orbitron'
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono'
import { View, ActivityIndicator } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { HeroUINativeProvider } from 'heroui-native'
import { QueryProvider } from '../providers/QueryProvider'

const cluster = createSolanaDevnet()
const identity = {
  name: 'SRC Mobile',
  uri: 'https://github.com/beeman/src-mobile-app',
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Orbitron_400Regular,
    Orbitron_700Bold,
    Orbitron_900Black,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  })

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0b0d', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#b6b0ff" />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <HeroUINativeProvider>
            <MobileWalletProvider cluster={cluster} identity={identity}>
              <StatusBar style="light" />
              <Slot />
            </MobileWalletProvider>
          </HeroUINativeProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
