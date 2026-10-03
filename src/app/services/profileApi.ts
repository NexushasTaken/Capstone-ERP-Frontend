import type { CurrentUser } from '@/app/types/profile'
import type { ApiEnvelope } from '@/app/utils/api/apiEnvelope'

const CURRENT_USER_STORAGE_KEY = 'erp.currentUser'

// Shape the backend sends: id, firstName, lastName, role (from both login and authorize endpoints)
export interface RawCurrentUser {
  id: number
  firstName: string
  lastName: string
  role: string
}

export function normalizeCurrentUser(raw: RawCurrentUser | null | undefined): CurrentUser | null {
  if (!raw) return null

  return {
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    role: raw.role,
  }
}

export function readStoredCurrentUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null

  try {
    const value = window.sessionStorage.getItem(CURRENT_USER_STORAGE_KEY)
    return value ? normalizeCurrentUser(JSON.parse(value) as RawCurrentUser) : null
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

  if (response.status === 401) {
    storeCurrentUser(null)
    return null
  }

  const data: ApiEnvelope<RawCurrentUser | null> = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch current user')
  }

  const user = normalizeCurrentUser(data.content)

  if (user) {
    storeCurrentUser(user)
    return user
  }

  return readStoredCurrentUser()
}
