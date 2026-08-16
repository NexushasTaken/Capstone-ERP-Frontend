import type { ModalProps } from '@/app/types/modal'

export default function AppModal({
  open,
  onClose,
  children,
  className = '',
}: ModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full rounded-none bg-white lg:max-w-lg lg:rounded-lg ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
