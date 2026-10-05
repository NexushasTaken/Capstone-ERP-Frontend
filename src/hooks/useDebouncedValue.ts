'use client'

import { useEffect, useState } from 'react'

// Returns `value` once it has stopped changing for `delayMs`, e.g. to avoid a request per keystroke.
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}
