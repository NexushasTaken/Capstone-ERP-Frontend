import type { ReactNode } from "react"
import AppModal from "@/components/AppModal"
import { cn } from "@/lib/utils"

export interface SeeMoreModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

// Read-only "See more" view: an AppModal that is never taller than its content.
export default function SeeMoreModal({ open, onClose, children, className }: SeeMoreModalProps) {
  return (
    <AppModal open={open} onClose={onClose} className={cn("h-auto xl:h-auto lg:max-w-lg", className)}>
      {children}
    </AppModal>
  )
}
