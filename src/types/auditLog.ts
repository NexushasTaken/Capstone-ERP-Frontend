import type { LucideIcon } from 'lucide-react'

export interface AuditLogItem {
  id: number
  module: string
  action: string
  message: string
  entityId: number | null
  userAccountId: number | null
  userFullName: string
  userRole: string | null
  created_At: string
}

export interface UserOption {
  id: number
  fullName: string
  isActive: boolean
}

// `value` is what the backend filter expects; `key` is the name it returns on each log.
export interface AuditActionOption {
  value: number
  key: string
  label: string
  Icon: LucideIcon
  className: string
}

export interface AuditModuleOption {
  value: number
  key: string
  label: string
}

export interface AuditFilterOption<T extends string | number> {
  value: T
  label: string
  description?: string
}

// API request/response shapes

export interface FetchAuditLogsParams {
  page?: number
  pageSize?: number
  userId?: number
  action?: number
  module?: number
  role?: string
}

export interface AuditLogListContent {
  logs: AuditLogItem[]
  pageCount: number
  rows: number
}
