import type { AuditLogItem } from '@/app/types/auditLog'

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
