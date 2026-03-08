export type GamePhase = 'PREPARATION' | 'RACE' | 'DISTRIBUTION'
export type ServerPhase = 'preparation' | 'resolution' | 'distribution'

export interface SpermRaceParams {
  baseSpeed: number
  segments?: {
    from: number
    to: number
    mult: number
  }[]
}

export interface SpermData {
  spermId: number
  totalBets: string
  bettorCount: number
}

export interface GameStatePayload {
  roundId: number
  phase: GamePhase | ServerPhase // Accept both formats
  phaseStartedAt: number
  phaseEndsAt: number
  totalPot: string
  sperms: SpermData[]
  commitment?: string
  winner?: number
  raceParams?: SpermRaceParams[]
  leaderboard?: number[]
}

export interface PoolUpdatePayload {
  roundId: number
  spermId: number
  totalBets: string
  bettorCount: number
  totalPot: string
}

export interface PhaseUpdatePayload {
  roundId: number
  phase: GamePhase | ServerPhase // Accept both formats
  startedAt: number
  endsAt: number
  commitment?: string
  winner?: number
  raceParams?: SpermRaceParams[]
  leaderboard?: number[]
  totalPot?: string
}

export interface RoundResultPayload {
  roundId: number
  winnerId: number
  totalPot: string
  isBabyKingHit: boolean
  raceParams?: SpermRaceParams[]
  leaderboard?: number[]
}

export interface RacerPosition {
  id: number
  x: number
  y: number
  progress: number
  finished: boolean
}
