"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import AppModal, { ModalActions, ModalHeader } from "@/components/AppModal"
import { FormField, FormInput } from "@/components/FormField"
import type { DriverListItem } from "@/types/driver"
import { formatDriverId } from "../_lib/driverHelpers"
import { driverSchema, type DriverFormValues } from "../_lib/driverSchema"

interface DriverFormModalProps {
  /** The driver being updated, or `null` to add a new one. */
  driver: DriverListItem | null
  disabled: boolean
  onClose: () => void
  onSubmit: (values: DriverFormValues) => void
}

// Add and update share this modal. Render it only while open so the fields start fresh each time.
export default function DriverFormModal({ driver, disabled, onClose, onSubmit }: DriverFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    mode: "onTouched",
    defaultValues: { firstName: driver?.firstName ?? "", lastName: driver?.lastName ?? "" },
  })
  const isEdit = driver !== null

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open>
      <ModalHeader
        subtitle={isEdit ? formatDriverId(driver.id) : "New driver"}
        title={isEdit ? "Update driver" : "Add driver"}
        onClose={onClose}
      />
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <FormField label="First name" error={errors.firstName?.message}>
          <FormInput aria-invalid={!!errors.firstName} className="capitalize" {...register("firstName")} />
        </FormField>
        <FormField label="Last name" error={errors.lastName?.message}>
          <FormInput aria-invalid={!!errors.lastName} className="capitalize" {...register("lastName")} />
        </FormField>
      </div>
      <ModalActions
        onCancel={onClose}
        onConfirm={handleSubmit(onSubmit)}
        confirmLabel={isEdit ? "Update driver" : "Add driver"}
        confirmIcon={isEdit ? undefined : Plus}
        confirmDisabled={!isValid || disabled}
      />
    </AppModal>
  )
}
