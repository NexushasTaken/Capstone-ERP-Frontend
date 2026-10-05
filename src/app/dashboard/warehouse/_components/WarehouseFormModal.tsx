"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import AppModal, { ModalActions, ModalBody, ModalHeader } from "@/components/AppModal"
import { FormField, FormInput } from "@/components/FormField"
import type { InsertWarehousePayload, WarehouseListItem } from "@/types/warehouse"

interface WarehouseFormModalProps {
  /** The warehouse being edited, or `null` to add a new one. */
  warehouse: WarehouseListItem | null
  disabled: boolean
  onClose: () => void
  onSubmit: (values: InsertWarehousePayload) => void
}

// Add and edit share this modal. Render it only while open so the fields start fresh each time.
export default function WarehouseFormModal({ warehouse, disabled, onClose, onSubmit }: WarehouseFormModalProps) {
  const [form, setForm] = useState({
    name: warehouse?.name ?? "",
    address: warehouse?.address ?? "",
  })
  const isEdit = warehouse !== null
  const canSubmit = !disabled && form.name.trim() !== "" && form.address.trim() !== ""

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open>
      <ModalHeader subtitle="Warehouse" title={isEdit ? "Edit warehouse" : "Add warehouse"} onClose={onClose} />
      <ModalBody>
        <FormField label="Warehouse name">
          <FormInput
            className="capitalize"
            onChange={(event) => updateField("name", event.target.value)}
            value={form.name}
          />
        </FormField>
        <FormField label="Address">
          <FormInput
            className="capitalize"
            onChange={(event) => updateField("address", event.target.value)}
            value={form.address}
          />
        </FormField>
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={() =>
          canSubmit &&
          onSubmit({
            name: form.name.trim(),
            address: form.address.trim(),
          })
        }
        confirmLabel={isEdit ? "Save changes" : "Add warehouse"}
        confirmIcon={isEdit ? undefined : Plus}
        confirmDisabled={!canSubmit}
      />
    </AppModal>
  )
}
