"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import AppModal, { ModalActions, ModalBody, ModalHeader } from "@/components/AppModal"
import { FormField, FormInput } from "@/components/FormField"
import type { InsertWarehousePayload, WarehouseListItem } from "@/types/warehouse"
import { warehouseSchema, type WarehouseFormValues } from "../_lib/warehouseSchema"

interface WarehouseFormModalProps {
  /** The warehouse being edited, or `null` to add a new one. */
  warehouse: WarehouseListItem | null
  disabled: boolean
  onClose: () => void
  onSubmit: (values: InsertWarehousePayload) => void
}

// Add and edit share this modal. Render it only while open so the fields start fresh each time.
export default function WarehouseFormModal({ warehouse, disabled, onClose, onSubmit }: WarehouseFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    mode: "onTouched",
    defaultValues: { name: warehouse?.name ?? "", address: warehouse?.address ?? "" },
  })
  const isEdit = warehouse !== null

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open>
      <ModalHeader subtitle="Warehouse" title={isEdit ? "Edit warehouse" : "Add warehouse"} onClose={onClose} />
      <ModalBody>
        <FormField label="Warehouse name" error={errors.name?.message}>
          <FormInput aria-invalid={!!errors.name} className="capitalize" {...register("name")} />
        </FormField>
        <FormField label="Address" error={errors.address?.message}>
          <FormInput aria-invalid={!!errors.address} className="capitalize" {...register("address")} />
        </FormField>
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={handleSubmit(onSubmit)}
        confirmLabel={isEdit ? "Save changes" : "Add warehouse"}
        confirmIcon={isEdit ? undefined : Plus}
        confirmDisabled={!isValid || disabled}
      />
    </AppModal>
  )
}
