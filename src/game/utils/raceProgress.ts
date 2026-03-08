import { SpermRaceParams } from '../types/GameState'

/**
 * Compute progress (0–1) at normalized time t for a sperm with optional segments.
 */
export function progressAtT(params: SpermRaceParams, t: number): number {
  const { baseSpeed, segments } = params
  if (!segments?.length) return t * baseSpeed

  let total = 0
  for (const seg of segments) {
    const segStart = Math.max(seg.from, 0)
    const segEnd = Math.min(seg.to, t)
    if (segEnd > segStart) {
      total += (segEnd - segStart) * baseSpeed * seg.mult
    }
    if (seg.to >= t) break
  }
  return total
}

/**
 * Max base speed (winner always has 1.0).
 */
export const MAX_BASE_SPEED = 1

/**
 * Calculate racer position based on race params and elapsed time
 */
export function calculateRacerPosition(
  params: SpermRaceParams,
  startedAt: number,
  endsAt: number,
  currentTime: number,
): number {
  const duration = endsAt - startedAt
  if (duration <= 0) return 0

  const elapsed = currentTime - startedAt
  const t = Math.min(1, Math.max(0, elapsed / duration))

  return progressAtT(params, t)
}
