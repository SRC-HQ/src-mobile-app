import { useEffect, useState } from 'react'
import { useGameStore } from '../../stores/gameStore'

/**
 * Hook untuk countdown timer phase
 * Returns remaining seconds until phase ends
 */
export const usePhaseTimer = () => {
  const { phaseEndsAt } = useGameStore()
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, phaseEndsAt - Date.now())
      setRemainingSeconds(Math.ceil(remaining / 1000))
    }

    // Update immediately
    updateTimer()

    // Update every 100ms for smooth countdown
    const interval = setInterval(updateTimer, 100)

    return () => clearInterval(interval)
  }, [phaseEndsAt])

  return remainingSeconds
}
