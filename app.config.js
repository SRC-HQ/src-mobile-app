module.exports = {
  expo: {
    scheme: 'spermrace',
    userInterfaceStyle: 'dark',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#100E12',
    },
    web: {
      output: 'static',
    },
    name: 'Sperm Race',
    slug: 'sperm-race',
    version: '1.0.0',
    android: {
      package: 'com.spermrace.app',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000',
      },
    },
    ios: {
      bundleIdentifier: 'com.spermrace.app',
      supportsTablet: false,
    },
    extra: {
      EXPO_PUBLIC_SOLANA_NETWORK: process.env.EXPO_PUBLIC_SOLANA_NETWORK || 'devnet',
      EXPO_PUBLIC_RPC_ENDPOINT: process.env.EXPO_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com',
      EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || 'development',
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.spermrace.club',
      EXPO_PUBLIC_WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'wss://api.spermrace.club/game',
      EXPO_PUBLIC_PROGRAM_ID: process.env.EXPO_PUBLIC_PROGRAM_ID || '2y2AdrVLKqwcA5GQEC1ULEHac3hH9ck565UBqzPaReJZ',
    },
    plugins: ['expo-router'],
  },
}
