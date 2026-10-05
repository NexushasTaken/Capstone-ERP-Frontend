import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import CloseButton from '@/components/CloseButton'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface AppModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

// shadcn Dialog: full-screen on mobile, centered on desktop. Escape or a backdrop click calls onClose.
export default function AppModal({
  open,
  onClose,
  children,
  className,
}: AppModalProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'h-full w-full max-w-none gap-0 rounded-none bg-white p-0 text-base sm:max-w-none lg:rounded-lg xl:h-auto',
          className
        )}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

// Use for a custom header, so the dialog is labelled by its title.
export const ModalTitle = DialogTitle

// Small caption (e.g. an ID) above the title, close button on the right.
export function ModalHeader({ subtitle, title, onClose }: { subtitle?: ReactNode; title: ReactNode; onClose: () => void }) {
  return (
    <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
      <div className="flex flex-col">
        <span className="text-xs text-[#737A76]">{subtitle}</span>
        <DialogTitle className="text-xl font-medium text-[#0c0d0d]">{title}</DialogTitle>
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
