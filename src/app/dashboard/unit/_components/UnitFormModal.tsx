"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import AppModal, { ModalActions, ModalBody, ModalHeader } from "@/components/AppModal"
import { FormField, FormInput } from "@/components/FormField"
import type { UnitListItem } from "@/types/unit"
import { formatUnitId } from "../_lib/unitHelpers"
import { unitSchema, type UnitFormValues } from "../_lib/unitSchema"

interface UnitFormModalProps {
  /** The unit being edited, or `null` to add a new one. */
  unit: UnitListItem | null
  disabled: boolean
  onClose: () => void
  onSubmit: (name: string) => void
}

// Add and edit share this modal. Render it only while open so the field starts fresh each time.
export default function UnitFormModal({ unit, disabled, onClose, onSubmit }: UnitFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    mode: "onTouched",
    defaultValues: { name: unit?.name ?? "" },
  })
  const isEdit = unit !== null

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open>
      <ModalHeader
        title={isEdit ? "Edit unit" : "Add unit"}
        detail={isEdit ? formatUnitId(unit.id) : undefined}
        onClose={onClose}
      />
      <ModalBody>
        <FormField label="Unit name" error={errors.name?.message}>
          <FormInput aria-invalid={!!errors.name} placeholder="e.g. kg pack, meter" {...register("name")} />
        </FormField>
        <p className="text-sm text-muted-foreground">
          Quantities are whole numbers. For a fixed pack size, put it in the product name, e.g. &quot;wood screw #8 (box
          of 100)&quot;.
        </p>
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={handleSubmit((values) => onSubmit(values.name))}
        confirmLabel={isEdit ? "Save changes" : "Add unit"}
        confirmIcon={isEdit ? undefined : Plus}
        confirmDisabled={!isValid || disabled}
      />
    </AppModal>
  )
}
