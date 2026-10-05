"use client"

import { useCallback, useSyncExternalStore } from "react"

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const

const CHANGE_EVENT = "page-size-change"
// Fallback for when localStorage is blocked, so the choice still holds until reload.
const memory = new Map<string, number>()

function isPageSize(value: number) {
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(value)
}

function storageKey(key: string) {
  return `pageSize:${key}`
}

function readPageSize(key: string, defaultSize: number) {
  try {
    const stored = Number(localStorage.getItem(storageKey(key)))
    if (isPageSize(stored)) return stored
  } catch {
    // Storage blocked; use the in-memory value below.
  }
  return memory.get(key) ?? defaultSize
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

// Rows per page for one list, remembered in this browser. The server render always uses `defaultSize`.
export function usePageSize(key: string, defaultSize = 10) {
  const pageSize = useSyncExternalStore(
    subscribe,
    () => readPageSize(key, defaultSize),
    () => defaultSize,
  )

  const setPageSize = useCallback(
    (size: number) => {
      memory.set(key, size)
      try {
        localStorage.setItem(storageKey(key), String(size))
      } catch {
        // Storage blocked (e.g. private window); `memory` keeps it until reload.
      }
      window.dispatchEvent(new Event(CHANGE_EVENT))
    },
    [key],
  )

  return [pageSize, setPageSize] as const
}
