# Game Implementation - Sperm Race Mobile

Implementasi game racer untuk mobile app menggunakan React Native, berdasarkan referensi dari `src-monorepo`.

## Struktur Folder

```
src/game/
├── constants/          # Konstanta game (racer count, colors, assets)
├── hooks/             # React hooks untuk game logic
│   └── useGameSocket.ts
├── services/          # Services untuk websocket connection
│   └── GameSocketService.ts
├── types/             # TypeScript types untuk game state
│   └── GameState.ts
└── utils/             # Utility functions
    └── raceProgress.ts
```

## Komponen Game

### 1. GameContainer

Komponen utama yang mengatur rendering scene berdasarkan phase:

- PREPARATION: Menampilkan daftar racer dan betting info
- RACE: Menampilkan race animation
- DISTRIBUTION: Menampilkan hasil race dan leaderboard

### 2. PreparationScene

Menampilkan:

- Countdown timer sebelum race dimulai
- Grid racer dengan icon, nama, total bets, dan jumlah bettor
- Total pot

### 3. RaceScene

Menampilkan:

- Race track dengan lanes
- Animated racer sprites
- Real-time position update berdasarkan race params dari server

### 4. DistributionScene

Menampilkan:

- Winner card dengan icon dan total pot
- Leaderboard dengan ranking 1-10
- Total bets per racer

## WebSocket Integration

### Connection

Game menggunakan Socket.io client untuk koneksi real-time ke game server.

**URL Configuration:**

- Development: `ws://localhost:4000/game`
- Devnet: `wss://api-devnet.spermrace.club/game`
- Mainnet: `wss://api.spermrace.club/game`

### Events

**Server → Client:**

- `game:state`: Initial game state saat connect
- `pool:update`: Update total bets dan bettor count
- `phase:update`: Transisi phase (PREPARATION → RACE → DISTRIBUTION)
- `round:result`: Hasil race dengan winner dan leaderboard

**Client → Server:**

- Saat ini hanya receive events, tidak ada emit dari client

## State Management

Menggunakan Zustand untuk global state management:

```typescript
interface GameStore {
  // Connection
  isConnected: boolean
  isStateSynced: boolean

  // Round info
  roundId: number
  phase: GamePhase
  phaseStartedAt: number
  phaseEndsAt: number

  // Pool data
  totalPot: string
  sperms: SpermData[]

  // Race data
  winner?: number
  raceParams?: SpermRaceParams[]
  leaderboard?: number[]

  // Racer positions
  racerPositions: RacerPosition[]
}
```

## Race Animation

### Progress Calculation

Race progress dihitung berdasarkan:

1. `raceParams`: Base speed dan segments untuk setiap racer
2. `phaseStartedAt` dan `phaseEndsAt`: Timing dari server
3. Current time: `Date.now()`

Formula:

```typescript
const duration = phaseEndsAt - phaseStartedAt
const elapsed = currentTime - phaseStartedAt
const t = elapsed / duration // 0 to 1

// With segments (speed boosts)
progress = progressAtT(raceParams[racerId], t)
```

### Animation

- Menggunakan `react-native-reanimated` untuk smooth animation
- Horizontal movement: Berdasarkan progress (0-1)
- Vertical bobbing: Simulasi swimming motion
- Scale animation: Saat racer finish

## Assets

Assets game disimpan di `assets/game/images/`:

- `racer_01.png` - `racer_10.png`: Sprite racer
- `icon_01.png` - `icon_10.png`: Icon racer untuk UI
- `bg_*.png`: Background images
- `item_*.png`: UI elements

## Usage

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Edit `.env` file untuk development:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_WS_URL=ws://localhost:4000/game
```

### 3. Run App

```bash
npm run dev
```

### 4. Navigate to Game

Buka route `/game` di app untuk melihat game screen.

## Perbedaan dengan Web Version

1. **Rendering Engine**:
   - Web: PixiJS (WebGL)
   - Mobile: React Native + Reanimated

2. **Layout**:
   - Web: Fixed canvas size (1280x768)
   - Mobile: Responsive, menyesuaikan screen size

3. **Assets**:
   - Web: Loaded via URL
   - Mobile: Bundled dengan app (require)

4. **Animation**:
   - Web: PixiJS ticker
   - Mobile: Reanimated worklets

## Logic yang Sama

✅ WebSocket connection dan event handling
✅ Race progress calculation dengan segments
✅ Phase transitions (PREPARATION → RACE → DISTRIBUTION)
✅ Pool updates dan betting info
✅ Winner determination dan leaderboard

## TODO / Future Improvements

- [ ] Add sound effects
- [ ] Add particle effects untuk race
- [ ] Add betting UI integration
- [ ] Add wallet integration untuk claim winnings
- [ ] Add race history
- [ ] Optimize performance untuk low-end devices
- [ ] Add offline mode / reconnection handling
- [ ] Add haptic feedback
- [ ] Add landscape mode support
