import type { CurrentUser } from '@/app/types/profile'
import type { ApiEnvelope } from '@/app/utils/api/apiEnvelope'

const CURRENT_USER_STORAGE_KEY = 'erp.currentUser'

export function readStoredCurrentUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null

  try {
    const value = window.sessionStorage.getItem(CURRENT_USER_STORAGE_KEY)
    return value ? (JSON.parse(value) as CurrentUser) : null
  } catch {
    return null
  }
}

export function storeCurrentUser(user: CurrentUser | null) {
  if (typeof window === 'undefined') return

  if (!user) {
    window.sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY)
    return
  }

  window.sessionStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user))
}

// GET
export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const response = await fetch('/api/View/authorize', {
    method: 'GET',
    credentials: 'include',
  })

  const data: ApiEnvelope<CurrentUser | null> = await response.json()

  if (response.status === 401) {
    storeCurrentUser(null)
    return null
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch current user')
  }

  if (data.content) {
    storeCurrentUser(data.content)
    return data.content
  }

  return readStoredCurrentUser()
}
