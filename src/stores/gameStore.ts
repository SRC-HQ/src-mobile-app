import { create } from 'zustand'
import {
  GamePhase,
  GameStatePayload,
  PoolUpdatePayload,
  PhaseUpdatePayload,
  RoundResultPayload,
  SpermRaceParams,
  SpermData,
  RacerPosition,
} from '../game/types/GameState'

// Map server phase names to client phase names
const PHASE_TO_MODE: Record<string, GamePhase> = {
  preparation: 'PREPARATION',
  resolution: 'RACE',
  distribution: 'DISTRIBUTION',
}

interface GameStore {
  // Connection state
  isConnected: boolean
  isStateSynced: boolean

  // Round info
  roundId: number
  phase: GamePhase
  phaseStartedAt: number
  phaseEndsAt: number
  phaseReceivedAt: number

  // Pool data
  totalPot: string
  sperms: SpermData[]

  // Race data
  commitment?: string
  winner?: number
  raceParams?: SpermRaceParams[]
  leaderboard?: number[]

  // Racer positions (for animation)
  racerPositions: RacerPosition[]

  // Actions
  setConnected: (connected: boolean) => void
  setGameState: (state: GameStatePayload) => void
  updatePool: (update: PoolUpdatePayload) => void
  updatePhase: (update: PhaseUpdatePayload) => void
  setRoundResult: (result: RoundResultPayload) => void
  updateRacerPositions: (positions: RacerPosition[]) => void
  reset: () => void
}

const initialState = {
  isConnected: false,
  isStateSynced: false,
  roundId: 0,
  phase: 'PREPARATION' as GamePhase,
  phaseStartedAt: 0,
  phaseEndsAt: 0,
  phaseReceivedAt: 0,
  totalPot: '0',
  sperms: [],
  racerPositions: [],
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setConnected: (connected) => set({ isConnected: connected }),

  setGameState: (state) => {
    // Map server phase to client phase
    const serverPhase = typeof state.phase === 'string' ? state.phase.toLowerCase() : state.phase
    const mappedPhase = (PHASE_TO_MODE[serverPhase] || state.phase) as GamePhase

    console.log('[GameStore] Setting game state:', {
      serverPhase: state.phase,
      normalizedPhase: serverPhase,
      mappedPhase,
      roundId: state.roundId,
      hasRaceParams: !!state.raceParams,
      raceParamsCount: state.raceParams?.length || 0,
    })

    set({
      isStateSynced: true,
      roundId: state.roundId,
      phase: mappedPhase,
      phaseStartedAt: state.phaseStartedAt,
      phaseEndsAt: state.phaseEndsAt,
      phaseReceivedAt: Date.now(),
      totalPot: state.totalPot,
      sperms: state.sperms,
      commitment: state.commitment,
      winner: state.winner,
      raceParams: state.raceParams,
      leaderboard: state.leaderboard,
    })
  },

  updatePool: (update) => {
    const { sperms, totalPot } = get()

    // Update total pot
    if (update.totalPot !== totalPot) {
      set({ totalPot: update.totalPot })
    }

    // Update specific sperm data
    const updatedSperms = sperms.map((sperm) =>
      sperm.spermId === update.spermId
        ? {
            ...sperm,
            totalBets: update.totalBets,
            bettorCount: update.bettorCount,
          }
        : sperm,
    )

    set({ sperms: updatedSperms })
  },

  updatePhase: (update) => {
    // Map server phase to client phase
    const serverPhase = typeof update.phase === 'string' ? update.phase.toLowerCase() : update.phase
    const mappedPhase = (PHASE_TO_MODE[serverPhase] || update.phase) as GamePhase

    console.log('[GameStore] Updating phase:', {
      serverPhase: update.phase,
      normalizedPhase: serverPhase,
      mappedPhase,
      roundId: update.roundId,
      hasRaceParams: !!update.raceParams,
      raceParamsCount: update.raceParams?.length || 0,
    })

    set({
      roundId: update.roundId,
      phase: mappedPhase,
      phaseStartedAt: update.startedAt,
      phaseEndsAt: update.endsAt,
      phaseReceivedAt: Date.now(),
      commitment: update.commitment,
      winner: update.winner,
      raceParams: update.raceParams,
      leaderboard: update.leaderboard,
      totalPot: update.totalPot || get().totalPot,
    })
  },

  setRoundResult: (result) => {
    set({
      winner: result.winnerId,
      raceParams: result.raceParams,
      leaderboard: result.leaderboard,
      totalPot: result.totalPot,
    })
  },

  updateRacerPositions: (positions) => {
    set({ racerPositions: positions })
  },

  reset: () => set(initialState),
}))
