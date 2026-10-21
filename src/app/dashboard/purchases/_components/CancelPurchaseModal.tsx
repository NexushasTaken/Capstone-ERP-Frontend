"use client"

import AppModal, { ModalActions, ModalBody, ModalHeader } from "@/components/AppModal"
import type { Purchase } from "@/types/purchase"
import { formatPurchaseId, formatSupplier } from "../_lib/purchaseHelpers"

interface CancelPurchaseModalProps {
  purchase: Purchase | null
  disabled: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function CancelPurchaseModal({ purchase, disabled, onClose, onConfirm }: CancelPurchaseModalProps) {
  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-md" onClose={onClose} open={purchase !== null}>
      <ModalHeader
        title="Cancel purchase"
        detail={purchase ? formatPurchaseId(purchase.id) : undefined}
        onClose={onClose}
      />
      <ModalBody>
        <p className="text-sm text-foreground">
          Cancel the order to{" "}
          <span className="font-medium capitalize">{formatSupplier(purchase?.supplierName ?? null)}</span>? Stock
          doesn&apos;t change, and a cancelled purchase can&apos;t be reopened.
        </p>
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={onConfirm}
        confirmLabel="Cancel purchase"
        confirmDisabled={disabled}
        destructive
      />
    </AppModal>
  )
}
