import type { AuditLogItem, UserOption } from "@/types/auditLog"
import type { AuditLogListContent, FetchAuditLogsParams } from "@/types/auditLog"
import { ApiEnvelope } from "@/types/api"

export async function fetchAuditLogs(
  params: FetchAuditLogsParams = {},
  signal?: AbortSignal,
): Promise<{
  items: AuditLogItem[]
  pageCount: number
  rows: number
}> {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.pageSize) query.set("pageSize", String(params.pageSize))
  if (params.userId) query.set("userId", String(params.userId))
  if (params.action) query.set("action", String(params.action))
  if (params.module) query.set("module", String(params.module))
  if (params.role) query.set("role", params.role)

  const response = await fetch(`/api/AuditLog/all?${query.toString()}`, {
    signal,
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch audit logs: ${response.status}`)
  }

  const data: ApiEnvelope<AuditLogListContent> = await response.json()

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch audit logs")
  }

  return {
    items: data.content.logs,
    pageCount: data.content.pageCount,
    rows: data.content.rows,
  }
}

export async function fetchUsers(signal?: AbortSignal): Promise<UserOption[]> {
  const response = await fetch("/api/User/all", {
    signal,
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`)
  }

  const data: ApiEnvelope<UserOption[]> = await response.json()

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch users")
  }

  return data.content
}
