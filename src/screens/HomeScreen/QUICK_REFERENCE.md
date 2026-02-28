# HomeScreen - Quick Reference Guide

## 🚀 Quick Start

### Import Components

```typescript
import { Navbar, GameCanvas, BetPanel, GameHistory, ChatPanel, BottomTabs } from './components'
```

### Basic Usage

```typescript
const [activeTab, setActiveTab] = useState<'bet' | 'history' | 'chat'>('bet')

<Navbar leftInset={insets.left} rightInset={insets.right} />
<GameCanvas />
{activeTab === 'bet' && <BetPanel />}
{activeTab === 'history' && <GameHistory />}
{activeTab === 'chat' && <ChatPanel />}
<BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
```

## 📁 File Locations

| Component    | Path                                                |
| ------------ | --------------------------------------------------- |
| Main Screen  | `src/screens/HomeScreen/HomeScreen.tsx`             |
| Navbar       | `src/screens/HomeScreen/components/Navbar.tsx`      |
| Game Canvas  | `src/screens/HomeScreen/components/GameCanvas.tsx`  |
| Bet Panel    | `src/screens/HomeScreen/components/BetPanel.tsx`    |
| Game History | `src/screens/HomeScreen/components/GameHistory.tsx` |
| Chat Panel   | `src/screens/HomeScreen/components/ChatPanel.tsx`   |
| Bottom Tabs  | `src/screens/HomeScreen/components/BottomTabs.tsx`  |

## 🎨 Common Styles

### Colors

```typescript
// Background
className = 'bg-[#0a0b0d]'

// Primary Button
className = 'bg-[#b6b0ff]'

// Border
className = 'border border-white/10'

// Text
className = 'text-white' // Primary
className = 'text-white/60' // Secondary
className = 'text-white/40' // Disabled
```

### Fonts

```typescript
// Headers
style={{ fontFamily: 'Orbitron_700Bold' }}

// Bold Text
style={{ fontFamily: 'SpaceMono_700Bold' }}

// Regular Text
style={{ fontFamily: 'SpaceMono_400Regular' }}
```

### Layout

```typescript
// Full width container
className = 'flex-1 bg-[#0a0b0d]'

// Card/Panel
className = 'rounded-lg border border-white/10 bg-white/5 p-4'

// Button
className = 'py-4 rounded-full items-center bg-[#b6b0ff]'
```

## 🔧 Common Tasks

### Add New Tab

1. Update type in `HomeScreen.tsx`:

```typescript
type TabType = 'bet' | 'history' | 'chat' | 'newTab'
```

2. Add tab in `BottomTabs.tsx`:

```typescript
const tabs = [
  { id: 'bet', label: 'Bet' },
  { id: 'history', label: 'History' },
  { id: 'chat', label: 'Chat' },
  { id: 'newTab', label: 'New Tab' },
]
```

3. Add case in `renderContent()`:

```typescript
case 'newTab':
  return <NewTabComponent />
```

### Modify Navbar

Edit `src/screens/HomeScreen/components/Navbar.tsx`:

```typescript
// Left side
<View className="flex-row items-center">
  {/* Your content */}
</View>

// Right side
<View className="flex-row items-center">
  {/* Your content */}
</View>
```

### Change Game Canvas Height

Edit `src/screens/HomeScreen/HomeScreen.tsx`:

```typescript
<View className="h-64">  {/* Change h-64 to desired height */}
  <GameCanvas />
</View>
```

### Add Stats to BetPanel

Edit `src/screens/HomeScreen/components/BetPanel.tsx`:

```typescript
<View className="flex-row flex-wrap gap-3 mb-4">
  {/* Add new stat card */}
  <View className="flex-1 min-w-[45%] rounded-lg border border-white/10 bg-white/5 p-3">
    <Text style={{ fontFamily: 'SpaceMono_700Bold' }}>Value</Text>
    <Text style={{ fontFamily: 'SpaceMono_400Regular' }}>Label</Text>
  </View>
</View>
```

## 🎯 Props Reference

### Navbar

```typescript
interface NavbarProps {
  leftInset?: number // Safe area left
  rightInset?: number // Safe area right
}
```

### BottomTabs

```typescript
interface BottomTabsProps {
  activeTab: 'bet' | 'history' | 'chat'
  onTabChange: (tab: TabType) => void
}
```

## 🔌 Wallet Integration

### Check Connection

```typescript
import { useMobileWallet } from '@wallet-ui/react-native-kit'

const { account } = useMobileWallet()
const isConnected = !!account?.address
```

### Connect/Disconnect

```typescript
const { connect, disconnect } = useMobileWallet()

// Connect
<Pressable onPress={connect}>
  <Text>Connect</Text>
</Pressable>

// Disconnect
<Pressable onPress={disconnect}>
  <Text>Disconnect</Text>
</Pressable>
```

### Display Address

```typescript
const shortAddress = account?.address
  ? `${account.address.toString().slice(0, 4)}...${account.address.toString().slice(-4)}`
  : ''
```

## 📱 Safe Area

### Get Insets

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const insets = useSafeAreaInsets()
// insets.top, insets.bottom, insets.left, insets.right
```

### Apply Padding

```typescript
// Top (Navbar)
<View style={{ paddingTop: insets.top }}>

// Bottom (Tabs)
<View style={{ paddingBottom: insets.bottom }}>

// Left/Right
<View style={{
  paddingLeft: Math.max(16, insets.left),
  paddingRight: Math.max(16, insets.right)
}}>
```

## 🐛 Common Issues

### Tab not switching

- Check `activeTab` state is updating
- Verify `onTabChange` is called
- Check `renderContent()` switch cases

### Wallet button not working

- Verify `useMobileWallet()` hook is available
- Check wallet provider is wrapped around app
- Test `connect()` and `disconnect()` functions

### Layout overflow

- Check flex properties
- Verify ScrollView is used for long content
- Test on different screen sizes

### Fonts not loading

- Ensure fonts are loaded in app root
- Check font family names match exactly
- Verify font files exist in assets

## 📊 State Management

### HomeScreen State

```typescript
const [activeTab, setActiveTab] = useState<TabType>('bet')
```

### BetPanel State

```typescript
const [betMode, setBetMode] = useState<'manual' | 'auto'>('manual')
const [selectedRacers, setSelectedRacers] = useState<number[]>([])
const [betAmount, setBetAmount] = useState<string>('')
const [autoMatches, setAutoMatches] = useState<string>('')
```

### ChatPanel State

```typescript
const [message, setMessage] = useState('')
const [messages, setMessages] = useState<ChatMessage[]>([])
```

## 🧪 Testing

### Test Checklist

- [ ] Portrait orientation locked
- [ ] Navbar displays correctly
- [ ] Tab switching works
- [ ] Wallet connect/disconnect
- [ ] Safe area insets applied
- [ ] All fonts loading
- [ ] Scrolling works in long content
- [ ] Input fields functional
- [ ] Buttons respond to press

### Test on Devices

- iPhone with notch
- iPhone without notch
- Android with gesture navigation
- Android with buttons
- Different screen sizes

## 📚 Additional Resources

- [Full Documentation](./README.md)
- [Layout Diagram](./LAYOUT_DIAGRAM.md)
- [Adjustment Summary](../../LAYOUT_PORTRAIT_ADJUSTMENT.md)
