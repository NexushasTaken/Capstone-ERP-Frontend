"use client"

import { useEffect, useEffectEvent, useState } from "react"

/**
 * A search box backed by a URL value. The box updates per keystroke; `onCommit` gets the trimmed text once
 * typing pauses. The box only follows the URL when it changes from elsewhere (back/forward, a clear),
 * never when the URL is catching up to our own commit, so text typed meanwhile isn't lost.
 */
export function useUrlSearch(urlValue: string, onCommit: (value: string) => void, delayMs = 400) {
  const [box, setBox] = useState(urlValue)
  const [seenUrl, setSeenUrl] = useState(urlValue)
  // The value we last pushed and haven't seen land in the URL yet.
  const [pending, setPending] = useState<string | null>(null)
  if (seenUrl !== urlValue) {
    setSeenUrl(urlValue)
    if (urlValue === pending) setPending(null)
    else setBox(urlValue)
  }

  const commit = useEffectEvent((value: string) => {
    if (value === urlValue) return
    setPending(value)
    onCommit(value)
  })

  useEffect(() => {
    const timeout = setTimeout(() => commit(box.trim()), delayMs)
    return () => clearTimeout(timeout)
  }, [box, delayMs])

  return [box, setBox] as const
}
