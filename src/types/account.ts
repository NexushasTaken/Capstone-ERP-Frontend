import type { Role } from "@/types/profile"

export interface AccountListItem {
  id: number
  role: Role
  firstName: string
  lastName: string
  email: string
}

export type AccountSortBy = "id" | "role" | "firstName" | "lastName" | "email"

export interface AccountSortOption {
  label: string
  value: AccountSortBy
  order: "asc" | "desc"
}

// API request/response shapes

export interface FetchAccountsParams {
  page?: number
  pageSize?: number
  name?: string
  /** Sort code, see getAccountFilter. */
  filter?: number
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
  currentPassword: string
  email: string
  password?: string
}
