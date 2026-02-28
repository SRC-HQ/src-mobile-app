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

### Devnet (Development)

```bash
npm run dev:devnet
npm run android:devnet
npm run ios:devnet
```

### Mainnet (Production)

```bash
npm run dev:mainnet
npm run android:mainnet
npm run ios:mainnet
```

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

## 📚 Documentation

- 📖 [QUICK_START.md](./QUICK_START.md) - Quick start guide
- 📋 [PROJECT_SETUP.md](./PROJECT_SETUP.md) - Detailed documentation
- 🔧 [INSTALLATION_FIX.md](./INSTALLATION_FIX.md) - Installation troubleshooting
- 💻 [COMMANDS.md](./COMMANDS.md) - Command reference
- ✅ [SETUP_SUMMARY.md](./SETUP_SUMMARY.md) - Setup checklist

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
