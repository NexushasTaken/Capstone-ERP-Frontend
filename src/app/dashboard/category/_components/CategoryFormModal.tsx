"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import AppModal, { ModalActions, ModalBody, ModalHeader } from "@/components/AppModal"
import { FormField, FormInput } from "@/components/FormField"
import type { CategoryListItem } from "@/types/category"
import { formatCategoryId } from "../_lib/categoryHelpers"
import { categorySchema, type CategoryFormValues } from "../_lib/categorySchema"

interface CategoryFormModalProps {
  /** The category being edited, or `null` to add a new one. */
  category: CategoryListItem | null
  disabled: boolean
  onClose: () => void
  onSubmit: (categoryName: string) => void
}

// Add and edit share this modal. Render it only while open so the field starts fresh each time.
export default function CategoryFormModal({ category, disabled, onClose, onSubmit }: CategoryFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    mode: "onTouched",
    defaultValues: { name: category?.type ?? "" },
  })
  const isEdit = category !== null

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open>
      <ModalHeader
        subtitle={isEdit ? formatCategoryId(category.id) : "New category item"}
        title={isEdit ? "Edit category" : "Add category"}
        onClose={onClose}
      />
      <ModalBody>
        <FormField label="Category name" error={errors.name?.message}>
          <FormInput aria-invalid={!!errors.name} className="capitalize" {...register("name")} />
        </FormField>
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={handleSubmit((values) => onSubmit(values.name))}
        confirmLabel={isEdit ? "Save changes" : "Add category"}
        confirmIcon={isEdit ? undefined : Plus}
        confirmDisabled={!isValid || disabled}
      />
    </AppModal>
  )
}
