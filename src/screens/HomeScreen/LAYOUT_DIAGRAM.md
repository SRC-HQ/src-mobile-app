# HomeScreen Layout Diagram

## Portrait Layout Structure

```
┌─────────────────────────────────────┐
│  ┌───┐              ┌──────────┐   │
│  │ 👤│              │ 💰 0.0000│   │  ← Navbar
│  └───┘              └──────────┘   │    - Profile (L)
│                                     │    - Balance (R)
├─────────────────────────────────────┤
│                                     │
│                                     │
│         🎮 GAME CANVAS              │  ← Game Frame
│                                     │    - Fixed height (256px)
│                                     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📊 Stats Grid              │   │
│  │  ┌────────┐  ┌────────┐    │   │
│  │  │Baby K. │  │  Time  │    │   │
│  │  └────────┘  └────────┘    │   │
│  │  ┌────────┐  ┌────────┐    │   │
│  │  │ Pool   │  │Your Pot│    │   │
│  │  └────────┘  └────────┘    │   │
│  │                             │   │
│  │  🏁 Racer Selection         │   │  ← Content Area
│  │  ○ ○ ○ ○ ○                 │   │    (Tab-based)
│  │  ○ ○ ○ ○ ○                 │   │
│  │                             │   │    Default: BetPanel
│  │  💰 Betting Panel           │   │    Tab 2: GameHistory
│  │  [Manual] [Auto]            │   │    Tab 3: ChatPanel
│  │                             │   │
│  │  Amount: _____ SOL          │   │
│  │                             │   │
│  │  [  Place Bet Button  ]     │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  [ BET ]  [ HISTORY ]  [ CHAT ]    │  ← Bottom Tabs
└─────────────────────────────────────┘
```

## Component Hierarchy

```
HomeScreen
├── Navbar
│   ├── Profile Avatar / Connect Button (Left)
│   └── Balance Display (Right)
│
├── GameCanvas (h-64)
│   └── Game Rendering Area
│
├── Content Area (flex-1)
│   ├── BetPanel (activeTab === 'bet')
│   │   ├── Stats Grid
│   │   ├── Racer Selection
│   │   ├── Betting Panel
│   │   │   ├── Manual/Auto Tabs
│   │   │   ├── Amount Input
│   │   │   └── Quick Amount Buttons
│   │   ├── Summary
│   │   └── Place Bet Button
│   │
│   ├── GameHistory (activeTab === 'history')
│   │   └── Race History List
│   │       ├── Header Row
│   │       └── History Rows
│   │
│   └── ChatPanel (activeTab === 'chat')
│       ├── Chat Messages (ScrollView)
│       │   └── Chat Bubbles
│       └── Input Area
│           ├── Text Input
│           └── Send Button
│
└── BottomTabs
    ├── Bet Tab
    ├── History Tab
    └── Chat Tab
```

## State Flow

```
┌─────────────────┐
│   HomeScreen    │
│                 │
│  State:         │
│  - activeTab    │◄─────┐
└────────┬────────┘      │
         │               │
         │ renders       │ onTabChange
         │               │
         ▼               │
┌─────────────────┐      │
│   BottomTabs    │──────┘
│                 │
│  Props:         │
│  - activeTab    │
│  - onTabChange  │
└─────────────────┘

┌─────────────────┐
│    BetPanel     │
│                 │
│  State:         │
│  - betMode      │
│  - selectedRacers│
│  - betAmount    │
│  - autoMatches  │
└─────────────────┘

┌─────────────────┐
│   ChatPanel     │
│                 │
│  State:         │
│  - message      │
│  - messages[]   │
└─────────────────┘
```

## Responsive Behavior

### Safe Area Insets

```
┌─────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← insets.top
├─────────────────────────────────────┤   (Status Bar)
│           Navbar                    │
├─────────────────────────────────────┤
│                                     │
│         Content Area                │
│                                     │
├─────────────────────────────────────┤
│         Bottom Tabs                 │
├─────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← insets.bottom
└─────────────────────────────────────┘   (Home Indicator)
```

### Wallet Connection States

#### Not Connected

```
┌─────────────────────────────────────┐
│  ┌──────────┐                       │
│  │ Connect  │                       │  ← Navbar
│  └──────────┘                       │    - Connect Button (L)
│                                     │    - No Balance (R)
├─────────────────────────────────────┤
│         Game Canvas                 │
├─────────────────────────────────────┤
│  BetPanel (Disabled State)          │
│  - Inputs disabled                  │
│  - Button shows "Connect Wallet"    │
└─────────────────────────────────────┘
```

#### Connected

```
┌─────────────────────────────────────┐
│  ┌───┐              ┌──────────┐   │
│  │ 👤│              │ 💰 1.2345│   │  ← Navbar
│  └───┘              └──────────┘   │    - Avatar (L)
│                                     │    - Balance (R)
├─────────────────────────────────────┤
│         Game Canvas                 │
├─────────────────────────────────────┤
│  BetPanel (Active State)            │
│  - All inputs enabled               │
│  - Can place bets                   │
└─────────────────────────────────────┘
```

## Tab Transitions

```
User taps "History" tab
         │
         ▼
┌─────────────────┐
│  BottomTabs     │
│  onTabChange()  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HomeScreen     │
│  setActiveTab() │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  renderContent()│
│  returns        │
│  <GameHistory/> │
└─────────────────┘
```

## Dimensions

- **Navbar Height**: 64px (h-16)
- **Game Canvas Height**: 256px (h-64)
- **Bottom Tabs Height**: ~56px (py-4)
- **Content Area**: flex-1 (remaining space)

## Color Scheme

```
Background:     #0a0b0d  (bg-[#0a0b0d])
Primary:        #b6b0ff  (bg-[#b6b0ff])
Border:         white/10 (border-white/10)
Text Primary:   white    (text-white)
Text Secondary: white/60 (text-white/60)
Text Disabled:  white/40 (text-white/40)
```

## Typography

```
Headers:        Orbitron_700Bold
Bold Text:      SpaceMono_700Bold
Regular Text:   SpaceMono_400Regular
```
