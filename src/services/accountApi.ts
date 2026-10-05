import type {
  AccountListItem,
  CreateAccountPayload,
  CredentialsInfo,
  FetchAccountsParams,
  ProfileInfo,
  UpdateCredentialsPayload,
} from "@/types/account"
import { ApiError } from "@/lib/apiError"
import type { ApiEnvelope, ApiEnvelopeNoContent } from "@/types/api"

interface RawAccountListItem {
  id: number
  role: AccountListItem["role"]
  firstName: string
  lastName: string
  email: string
}

function mapAccount(item: RawAccountListItem): AccountListItem {
  return {
    id: item.id,
    role: item.role,
    firstName: item.firstName,
    lastName: item.lastName,
    email: item.email,
  }
}

interface RawAccountPage {
  accounts: RawAccountListItem[]
  pageCount: number
  rows: number
}

export async function fetchAccounts(
  params: FetchAccountsParams = {},
  signal?: AbortSignal,
): Promise<{ items: AccountListItem[]; pageCount: number; rows: number }> {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set("page", String(params.page))
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize))
  if (params.name) query.set("name", params.name)
  if (params.filter !== undefined) query.set("filter", String(params.filter))

  const response = await fetch(`/api/User/accounts?${query.toString()}`, {
    method: "GET",
    credentials: "include",
    signal,
  })

  const data: ApiEnvelope<RawAccountPage> = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to fetch accounts", response.status, data.errors)
  }

  return {
    items: data.content.accounts.map(mapAccount),
    pageCount: data.content.pageCount,
    rows: data.content.rows,
  }
}

export async function createAccount(payload: CreateAccountPayload): Promise<void> {
  const response = await fetch("/api/User/accounts", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to create account", response.status, data.errors)
  }
}

export async function updateAccountRole(id: number, role: AccountListItem["role"]): Promise<void> {
  const response = await fetch(`/api/User/accounts/${id}/role`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to update account", response.status, data.errors)
  }
}

export async function deleteAccount(id: number): Promise<void> {
  const response = await fetch(`/api/User/accounts/${id}`, {
    method: "DELETE",
    credentials: "include",
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to delete account", response.status, data.errors)
  }
}

export async function updateProfileInfo(payload: ProfileInfo): Promise<void> {
  const response = await fetch("/api/User/me/profile", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to update profile information", response.status, data.errors)
  }
}

export async function fetchCredentials(): Promise<CredentialsInfo> {
  const response = await fetch("/api/User/me/credentials", {
    method: "GET",
    credentials: "include",
  })

  const data: ApiEnvelope<CredentialsInfo> = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to fetch account settings", response.status, data.errors)
  }

  return data.content
}

export async function updateAccountCredentials(payload: UpdateCredentialsPayload): Promise<void> {
  const response = await fetch("/api/User/me/credentials", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Failed to update account settings", response.status, data.errors)
  }
}
