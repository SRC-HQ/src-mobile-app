# 🏁 Sperm Race Mobile App

A Solana mobile racing app built with Expo, React Native, Uniwind, and Solana Mobile Wallet Adapter.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server (Devnet)
npm run dev:devnet

# 3. Scan QR code with Expo Go or build to device
npm run android:devnet  # Android
npm run ios:devnet      # iOS
```

📖 **Detailed guide**: [QUICK_START.md](./QUICK_START.md)

## ⚠️ Installation Issues?

If you encounter `ERESOLVE` errors during `npm install`, see [INSTALLATION_FIX.md](./INSTALLATION_FIX.md)

**Quick fix**:

```bash
npm install --legacy-peer-deps
```

## 🌍 Environment

### Production (Devnet - Default)

```bash
npm run dev
npm run android
npm run ios
```

Uses: `https://api.spermrace.club` with devnet network

### Local Development

```bash
npm run dev:local
npm run android:local
npm run ios:local
```

Uses: `http://localhost:4000` with local API server

### Devnet (Production)

```bash
npm run dev:devnet
npm run android:devnet
npm run ios:devnet
```

Uses: `https://api.spermrace.club` with devnet network

### Mainnet (Production)

```bash
npm run dev:mainnet
npm run android:mainnet
npm run ios:mainnet
```

Uses: `https://api.spermrace.club` with mainnet network

See [ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md) for detailed configuration.

## 📱 Features

- ✅ Splash screen with branding
- ✅ Login with Solana Mobile Wallet Adapter
- ✅ Home screen with wallet info & balance
- ✅ Secure wallet connection
- ✅ Support for Devnet & Mainnet
- 🔄 Race game (Coming soon)
- 🔄 Leaderboard (Coming soon)

## 🎨 Tech Stack

- **Expo** - React Native framework
- **Expo Router** - File-based routing
- **Tailwind CSS + Uniwind** - Styling system
- **HeroUI Native** - UI component library
- **Solana Mobile Wallet Adapter** - Wallet integration
- **@solana/kit** - Solana SDK toolkit
- **AsyncStorage** - Local storage
- **React Query** - Data fetching & caching

## 📁 Project Structure

```
src/
├── app/              # Expo Router pages
├── components/       # Reusable components
├── screens/          # Screen components
├── config/           # Configuration (theme, network)
├── services/         # Business logic (wallet, storage)
├── utils/            # Helpers & constants
└── types/            # TypeScript types
```

## 🛠 Development

```bash
npm run dev          # Start dev server
npm run lint         # Run linter
npm run fmt          # Format code
npm run doctor       # Check setup
```

## 🐛 Troubleshooting

### Installation Error

```bash
npm install --legacy-peer-deps
```

### Metro Bundler Issues

```bash
npm run dev -- --clear --reset-cache
```

## 📝 License

MIT

---

## 🎮 Game Implementation

Game racer telah diimplementasikan pada mobile app ini!

### Quick Start

```bash
# Install dependencies
npm install

# Run development
npm run dev

# Navigate to /game route in the app
```

### Features

- ✅ Real-time race animation
- ✅ WebSocket integration untuk live updates
- ✅ 3 game phases: Preparation, Race, Distribution
- ✅ 10 unique racers dengan animations
- ✅ Live pool updates
- ✅ Winner determination dan leaderboard

### Documentation

- **[QUICK_START_GAME.md](./QUICK_START_GAME.md)** - Quick start guide
- **[GAME_IMPLEMENTATION.md](./GAME_IMPLEMENTATION.md)** - Full implementation guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation summary
- **[IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)** - Complete checklist
- **[src/game/README.md](./src/game/README.md)** - Game module documentation

### Game Structure

```
src/
├── game/                    # Game logic dan utilities
│   ├── constants/          # Game constants
│   ├── hooks/             # Custom hooks (useGameSocket, useRaceAnimation)
│   ├── services/          # WebSocket service
│   ├── types/             # TypeScript types
│   └── utils/             # Race progress calculation
├── components/game/        # Game UI components
│   ├── GameContainer.tsx
│   ├── PreparationScene.tsx
│   ├── RaceScene.tsx
│   ├── DistributionScene.tsx
│   ├── RaceTrack.tsx
│   └── RacerSprite.tsx
├── stores/
│   └── gameStore.ts       # Zustand store untuk game state
└── screens/GameScreen/    # Game screen

assets/game/images/         # Game assets (40 files)
```

### Environment Configuration

Configure WebSocket URL in `.env` files:

```env
# Development
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_WS_URL=ws://localhost:4000/game

# Devnet
EXPO_PUBLIC_API_URL=https://api-devnet.spermrace.club
EXPO_PUBLIC_WS_URL=wss://api-devnet.spermrace.club/game

# Mainnet
EXPO_PUBLIC_API_URL=https://api.spermrace.club
EXPO_PUBLIC_WS_URL=wss://api.spermrace.club/game
```

### Testing

```bash
# Development
npm run dev

# Devnet
npm run dev:devnet

# Mainnet
npm run dev:mainnet

# Android build
npm run android
npm run android:devnet
npm run android:mainnet
```

### Game Flow

1. **Connect** → WebSocket connection to game server
2. **Preparation Phase** → Display racers, pool info, countdown
3. **Race Phase** → Animate racers based on server race params
4. **Distribution Phase** → Show winner and leaderboard

### WebSocket Events

- `game:state` - Initial game state on connect
- `pool:update` - Real-time pool updates
- `phase:update` - Phase transitions
- `round:result` - Race results with winner

### Next Steps

- [ ] Integrate selection UI with wallet
- [ ] Add claim winnings functionality
- [ ] Add sound effects
- [ ] Add haptic feedback
- [ ] Add race history

For detailed information, see [GAME_IMPLEMENTATION.md](./GAME_IMPLEMENTATION.md).
