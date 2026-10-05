import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import CloseButton from '@/components/CloseButton'
import { Button } from '@/components/ui/button'

interface AppModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

// Full-screen on mobile, centered dialog on desktop. Clicking the backdrop closes it.
export default function AppModal({
  open,
  onClose,
  children,
  className = '',
}: AppModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`h-full xl:h-auto w-full rounded-none bg-white lg:rounded-lg ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// Small caption (e.g. an ID) above the title, close button on the right.
export function ModalHeader({ subtitle, title, onClose }: { subtitle?: ReactNode; title: ReactNode; onClose: () => void }) {
  return (
    <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
      <div className="flex flex-col">
        <span className="text-xs text-[#737A76]">{subtitle}</span>
        <span className="text-xl font-medium text-[#0c0d0d]">{title}</span>
      </div>
      <CloseButton onClick={onClose} />
    </div>
  )
}

export function ModalBody({ children, className = 'gap-4' }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col p-4 ${className}`}>{children}</div>
}

interface ModalActionsProps {
  onCancel: () => void
  onConfirm: () => void
  confirmLabel: string
  confirmDisabled?: boolean
  confirmIcon?: LucideIcon
  destructive?: boolean
}

// Footer with "Cancel" and the modal's main action.
export function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
  confirmDisabled = false,
  confirmIcon: ConfirmIcon,
  destructive = false,
}: ModalActionsProps) {
  return (
    <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
      <Button
        className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
        onClick={onCancel}
        type="button"
        variant="outline"
      >
        Cancel
      </Button>
      <Button
        className="rounded-xl px-3 py-2 text-sm"
        disabled={confirmDisabled}
        onClick={onConfirm}
        type="button"
        variant={destructive ? 'destructive' : 'default'}
      >
        {ConfirmIcon && <ConfirmIcon className="h-4 w-4" />}
        {confirmLabel}
      </Button>
    </div>
  )
}
