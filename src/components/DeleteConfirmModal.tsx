import type { ReactNode } from 'react'
import AppModal, { ModalActions, ModalBody, ModalHeader } from '@/components/AppModal'

interface DeleteConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  /** What is being deleted, e.g. "category" -> "Delete category". */
  entityName: string
  /** Shown above the title, usually the formatted ID. */
  subtitle?: ReactNode
  /** Shown under the question, usually the item's name. */
  itemLabel?: ReactNode
  disabled?: boolean
}

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  entityName,
  subtitle,
  itemLabel,
  disabled = false,
}: DeleteConfirmModalProps) {
  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open={open}>
      <ModalHeader subtitle={subtitle} title={`Delete ${entityName}`} onClose={onClose} />
      <ModalBody className="gap-2">
        <span className="text-sm text-[#121514]">
          Are you sure you want to delete this {entityName}?
        </span>
        <span className="text-sm font-medium text-[#0c0d0d] capitalize">{itemLabel}</span>
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={onConfirm}
        confirmLabel={`Delete ${entityName}`}
        confirmDisabled={disabled}
        destructive
      />
    </AppModal>
  )
}
