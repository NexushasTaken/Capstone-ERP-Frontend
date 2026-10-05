'use client'

import { useEffect, useState } from 'react'

// A countdown in whole seconds. `start()` begins it; `isActive` is true until it reaches 0.
export function useCooldown(seconds: number) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (remaining <= 0) return
    const timer = setTimeout(() => setRemaining((previous) => previous - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining])

  return {
    remaining,
    isActive: remaining > 0,
    start: () => setRemaining(seconds),
  }
}
