# HomeScreen - Portrait Layout

## Overview

HomeScreen telah di-refactor untuk layout portrait dengan struktur yang lebih maintainable dan modular.

## Layout Structure

```
┌─────────────────────────────┐
│         Navbar              │ ← Profile (kiri) | Balance (kanan)
├─────────────────────────────┤
│                             │
│      Game Canvas            │ ← Fixed height (h-64)
│                             │
├─────────────────────────────┤
│                             │
│   Content Area (Tabs)       │ ← Bet / History / Chat
│                             │
│                             │
├─────────────────────────────┤
│    Bottom Tabs              │ ← Tab Navigation
└─────────────────────────────┘
```

## Components

### 1. Navbar (`components/Navbar.tsx`)

- **Left**: Profile Avatar (jika connected) atau Connect Button
- **Center**: Kosong
- **Right**: Balance display (jika connected)
- Responsive dengan safe area insets

### 2. GameCanvas (`components/GameCanvas.tsx`)

- Fixed height (h-64 / 256px)
- Menampilkan game frame
- Placeholder untuk game rendering

### 3. BetPanel (`components/BetPanel.tsx`)

- Default content di bawah game canvas
- Fitur:
  - Top stats grid (Baby King, Time, Prize Pool, Your Pot)
  - Racer selection (10 racers)
  - Manual/Auto betting mode
  - Bet amount input dengan quick amount buttons
  - Summary dan Place Bet button

### 4. GameHistory (`components/GameHistory.tsx`)

- Menampilkan history race sebelumnya
- Table format dengan:
  - Race number
  - Winner
  - Winners count
  - Total pool

### 5. ChatPanel (`components/ChatPanel.tsx`)

- Live chat untuk players
- Chat bubbles dengan avatar
- Input area (disabled jika belum connect wallet)

### 6. BottomTabs (`components/BottomTabs.tsx`)

- Tab navigation untuk switch antara:
  - Bet (default)
  - History
  - Chat
- Active tab indicator dengan border top

## File Structure

```
src/screens/HomeScreen/
├── HomeScreen.tsx           # Main screen component
├── index.tsx               # Export barrel
├── README.md              # Documentation (this file)
└── components/
    ├── index.ts           # Component exports
    ├── Navbar.tsx         # Top navigation bar
    ├── GameCanvas.tsx     # Game display area
    ├── BetPanel.tsx       # Betting interface
    ├── GameHistory.tsx    # Race history list
    ├── ChatPanel.tsx      # Chat interface
    └── BottomTabs.tsx     # Tab navigation
```

## State Management

### HomeScreen State

- `activeTab`: Current active tab ('bet' | 'history' | 'chat')

### BetPanel State

- `betMode`: 'manual' | 'auto'
- `selectedRacers`: Array of selected racer indices
- `betAmount`: Bet amount string
- `autoMatches`: Number of auto matches

### ChatPanel State

- `message`: Current message input
- `messages`: Array of chat messages

## Orientation Lock

App dikonfigurasi untuk portrait only di `app.config.js`:

```javascript
orientation: 'portrait'
```

## Safe Area Handling

Semua komponen menggunakan `useSafeAreaInsets()` untuk handle:

- Top inset (status bar)
- Bottom inset (home indicator)
- Left/Right insets (notch devices)

## Styling

- Menggunakan Tailwind CSS (uniwind)
- Font families:
  - `Orbitron_700Bold`: Headers
  - `SpaceMono_700Bold`: Bold text
  - `SpaceMono_400Regular`: Regular text
- Color scheme:
  - Background: `#0a0b0d`
  - Primary: `#b6b0ff`
  - Borders: `white/10`

## Future Improvements

1. Connect dengan actual game state
2. Implement real-time chat dengan WebSocket
3. Add animations untuk tab transitions
4. Implement pull-to-refresh untuk history
5. Add loading states
6. Error handling dan retry logic
