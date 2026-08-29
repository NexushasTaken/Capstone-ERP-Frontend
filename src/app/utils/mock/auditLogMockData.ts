import type { LucideIcon } from 'lucide-react'

export interface AuditLog {
  id: string
  label: string
  detail: string
  firstName: string
  time: string
  Icon: LucideIcon
  className: string
}

export const auditLogs: AuditLog[] = []