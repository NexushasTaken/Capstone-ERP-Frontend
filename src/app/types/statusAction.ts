import type { LucideIcon } from 'lucide-react'

export type StatusActionValue = 'edit' | 'delete'

export interface StatusActionItem {
  label: string
  value: StatusActionValue
  icon: LucideIcon
  variant?: 'default' | 'destructive'
}

export interface StatusActionProps {
  actions: StatusActionItem[]
  label: string
  onAction: (action: StatusActionValue) => void
}
