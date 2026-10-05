import type { LucideIcon } from 'lucide-react'

export type StatusActionValue = string

export interface StatusActionItem {
  label: string
  value: StatusActionValue
  icon?: LucideIcon
  variant?: 'default' | 'destructive'
}

