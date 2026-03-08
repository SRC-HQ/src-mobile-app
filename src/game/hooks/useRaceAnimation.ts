import { useEffect, useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { calculateRacerPosition } from '../utils/raceProgress'
import { RACER_COUNT } from '../constants'

export interface RacerAnimationState {
  progress: number
  isFinished: boolean
}

/**
 * Hook untuk mengelola animasi race
 * Menghitung progress setiap racer berdasarkan raceParams dan waktu
 */
export const useRaceAnimation = () => {
  const { phase, raceParams, phaseStartedAt, phaseEndsAt } = useGameStore()

  const [racerStates, setRacerStates] = useState<RacerAnimationState[]>(
    Array(RACER_COUNT).fill({ progress: 0, isFinished: false }),
  )

  useEffect(() => {
    console.log('[useRaceAnimation] Effect triggered:', {
      phase,
      hasRaceParams: !!raceParams,
      raceParamsLength: raceParams?.length || 0,
      phaseStartedAt,
      phaseEndsAt,
    })

    if (phase !== 'RACE' || !raceParams || raceParams.length < RACER_COUNT) {
      console.log('[useRaceAnimation] Conditions not met, skipping animation')
      return
    }

    console.log('[useRaceAnimation] Starting race animation')
    let animationFrameId: number
    const finishedSet = new Set<number>()

    const updatePositions = () => {
      const currentTime = Date.now()
      const newStates: RacerAnimationState[] = []

      for (let i = 0; i < RACER_COUNT; i++) {
        const progress = calculateRacerPosition(raceParams[i], phaseStartedAt, phaseEndsAt, currentTime)

        const isFinished = progress >= 1
        if (isFinished && !finishedSet.has(i)) {
          finishedSet.add(i)
          console.log(`[useRaceAnimation] Racer ${i} finished!`)
        }

        newStates.push({
          progress: Math.min(1, Math.max(0, progress)),
          isFinished,
        })
      }

      setRacerStates(newStates)

      // Continue animation if race not finished
      if (currentTime < phaseEndsAt) {
        animationFrameId = requestAnimationFrame(updatePositions)
      } else {
        console.log('[useRaceAnimation] Race finished!')
      }
    }

    animationFrameId = requestAnimationFrame(updatePositions)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [phase, raceParams, phaseStartedAt, phaseEndsAt])

  return racerStates
}
