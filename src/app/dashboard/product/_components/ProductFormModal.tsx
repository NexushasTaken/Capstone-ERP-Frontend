"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import AppModal, { ModalActions, ModalBody, ModalHeader } from "@/components/AppModal"
import EntityDropdown from "@/components/EntityDropdown"
import { FormField, FormInput } from "@/components/FormField"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchCategories } from "@/services/categoryApi"
import { queryKeys } from "@/lib/query/queryKeys"
import type { ProductListItem } from "@/types/product"
import { useSelectableUnits, type ProductValues } from "../_hooks/useProducts"
import { formatCategoryId } from "@/lib/helpers/categoryHelpers"
import { formatProductId } from "@/lib/helpers/productHelpers"
import { productSchema, type ProductFormValues } from "../_lib/productSchema"

const ALL_CATEGORIES = { page: 1, pageSize: 1000 }

interface ProductFormModalProps {
  /** The product being edited, or `null` to add a new one. */
  product: ProductListItem | null
  disabled: boolean
  onClose: () => void
  onSubmit: (values: ProductValues) => void
}

// Add and edit share this modal. Render it only while open so the fields start fresh each time.
export default function ProductFormModal({ product, disabled, onClose, onSubmit }: ProductFormModalProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    mode: "onTouched",
    defaultValues: {
      name: product?.name ?? "",
      categoryId: product?.categoryId ?? 0,
      price: product?.price,
      // new products start as pieces (the seeded "pc", id 1)
      unitId: product?.unitId ?? 1,
    },
  })
  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: queryKeys.categories.all(ALL_CATEGORIES),
    queryFn: () => fetchCategories(ALL_CATEGORIES),
  })

  const isEdit = product !== null
  const categories = categoriesResponse?.items ?? []
  const categoryOptions = [
    { id: 0, label: "No category" },
    ...categories.map((category) => ({
      id: category.id,
      label: category.type,
      sublabel: formatCategoryId(category.id),
    })),
  ]
  const categoryName = (categoryId: number) => categories.find((category) => category.id === categoryId)?.type ?? null

  const { data: unitsResponse } = useSelectableUnits()
  const unitOptions = (unitsResponse?.items ?? []).map((unit) => ({ value: unit.id, label: unit.name }))
  const unitName = (unitId: number) => unitOptions.find((unit) => unit.value === unitId)?.label ?? null

  const submit = handleSubmit((values) =>
    onSubmit({ ...values, categoryName: categoryName(values.categoryId), unitName: unitName(values.unitId) }),
  )

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open>
      <ModalHeader
        title={isEdit ? "Edit product" : "Add product"}
        detail={isEdit ? formatProductId(product.id) : undefined}
        onClose={onClose}
      />
      <ModalBody>
        <FormField label="Product name" error={errors.name?.message}>
          <FormInput aria-invalid={!!errors.name} className="capitalize" {...register("name")} />
        </FormField>

        <FormField label="Category" error={errors.categoryId?.message}>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <EntityDropdown
                emptyLabel="No categories found"
                isLoading={categoriesLoading}
                onSelect={field.onChange}
                options={categoryOptions}
                placeholder="No category"
                searchPlaceholder="Search categories..."
                value={field.value === 0 ? "" : (categoryName(field.value) ?? "")}
              />
            )}
          />
        </FormField>

        <FormField label="Unit" error={errors.unitId?.message}>
          <Controller
            control={control}
            name="unitId"
            render={({ field }) => (
              <Select
                items={unitOptions}
                value={field.value}
                onValueChange={(value) => {
                  if (typeof value === "number") field.onChange(value)
                }}
              >
                <SelectTrigger aria-label="Unit" aria-invalid={!!errors.unitId} className="w-full">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField label="Price per unit" error={errors.price?.message}>
          <FormInput
            aria-invalid={!!errors.price}
            min={1}
            step="any"
            type="number"
            {...register("price", { valueAsNumber: true })}
          />
        </FormField>
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={submit}
        confirmLabel={isEdit ? "Save changes" : "Add product"}
        confirmIcon={isEdit ? undefined : Plus}
        confirmDisabled={!isValid || disabled}
      />
    </AppModal>
  )
}
