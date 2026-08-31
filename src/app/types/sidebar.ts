import type { ReactNode } from 'react'

export interface SidebarFormProps {
  isOpen: boolean
  onClose: () => void
}

export interface DashboardShellProps {
  children: ReactNode
}