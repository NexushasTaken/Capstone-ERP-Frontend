import type {
  AccountListItem,
  CreateAccountPayload,
  CredentialsInfo,
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

export async function fetchAccounts(): Promise<AccountListItem[]> {
  const response = await fetch("/api/User/accounts", {
    method: "GET",
    credentials: "include",
  })

  const data: ApiEnvelope<RawAccountListItem[]> = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch accounts")
  }

  return data.content.map(mapAccount)
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
    throw new ApiError(data.message || "Failed to create account", response.status)
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
    throw new Error(data.message || "Failed to update account")
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
    throw new Error(data.message || "Failed to update profile information")
  }
}

export async function fetchCredentials(): Promise<CredentialsInfo> {
  const response = await fetch("/api/User/me/credentials", {
    method: "GET",
    credentials: "include",
  })

  const data: ApiEnvelope<CredentialsInfo> = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch account settings")
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
    throw new Error(data.message || "Failed to update account settings")
  }
}
