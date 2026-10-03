import type { Role } from '@/app/types/profile'

export interface AccountListItem {
  id: number
  role: Role
  firstName: string
  lastName: string
  email: string
}

export type AccountSortBy = 'id' | 'role' | 'firstName' | 'lastName' | 'email'

export interface AccountSortOption {
  label: string
  value: AccountSortBy
  order: 'asc' | 'desc'
}

export interface CreateAccountPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  role: Role
}

export interface ProfileInfo {
  firstName: string
  lastName: string
}

export interface CredentialsInfo {
  email: string
}

export interface UpdateCredentialsPayload {
  email: string
  password?: string
}
