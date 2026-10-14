import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import CloseButton from "@/components/CloseButton"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface AppModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

// shadcn Dialog: full-screen on mobile, centered on desktop. Escape or a backdrop click calls onClose.
export default function AppModal({ open, onClose, children, className }: AppModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "h-full w-full max-w-none gap-0 rounded-none bg-background p-0 text-base sm:max-w-none lg:rounded-lg xl:h-auto",
          className,
        )}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

// One row: "Edit product · PRD-0003", what the modal is, then which record (if any).
// `extra` (e.g. a status badge) sits after the title; the close button is on the right.
export function ModalHeader({
  title,
  detail,
  extra,
  onClose,
  className,
}: {
  title: ReactNode
  detail?: ReactNode
  extra?: ReactNode
  onClose: () => void
  className?: string
}) {
  return (
    <div className={cn("flex w-full items-center justify-between gap-2 border-b border-border p-4", className)}>
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <DialogTitle className="text-xl font-medium text-foreground">
          {title}
          {detail ? (
            <>
              <span className="mx-1 text-muted-foreground"> · </span>
              {detail}
            </>
          ) : null}
        </DialogTitle>
        {extra}
      </div>
      <CloseButton onClick={onClose} />
    </div>
  )
}

export function ModalBody({ children, className = "gap-4" }: { children: ReactNode; className?: string }) {
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
    <div className="flex justify-end gap-2 border-t border-border p-4">
      <Button onClick={onCancel} type="button" variant="outline">
        Cancel
      </Button>
      <Button
        disabled={confirmDisabled}
        onClick={onConfirm}
        type="button"
        variant={destructive ? "destructive" : "default"}
      >
        {ConfirmIcon && <ConfirmIcon className="h-4 w-4" />}
        {confirmLabel}
      </Button>
    </div>
  )
}
