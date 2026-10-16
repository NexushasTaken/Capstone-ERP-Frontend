"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import AppModal, { ModalActions, ModalBody, ModalHeader } from "@/components/AppModal"
import EntityDropdown from "@/components/EntityDropdown"
import { FormField, FormInput } from "@/components/FormField"
import { useInventoryProductSearch } from "@/hooks/useInventoryProductSearch"
import { formatPeso } from "@/lib/format"
import { formatInventoryId } from "@/lib/helpers/inventoryHelpers"
import type { InventoryListItem } from "@/types/inventory"
import { inventorySchema, type InventoryFields } from "../_lib/inventorySchema"

export interface InventoryFormValues {
  productId: number
  /** For the optimistic row; the API names the item after its product. */
  productName: string
  reorderPoint: number
  /** Only set when adding. */
  quantity: number
}

interface InventoryFormModalProps {
  open: boolean
  /** The item being edited, or `null` to add a new one. Editing only changes the reorder point. */
  item: InventoryListItem | null
  disabled: boolean
  onClose: () => void
  onSubmit: (values: InventoryFormValues) => void
}

export default function InventoryFormModal({ open, item, disabled, onClose, onSubmit }: InventoryFormModalProps) {
  const isEdit = item !== null
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<InventoryFields>({
    resolver: zodResolver(inventorySchema(isEdit)),
    mode: "onTouched",
    defaultValues: {
      productId: item?.productId,
      reorderPoint: item?.reorderPoint,
      quantity: item?.quantity,
    },
  })
  const { products, isLoading: productsLoading, error: productsError } = useInventoryProductSearch(open && !isEdit)

  const productName = (id?: number) => products.find((product) => product.id === id)?.name ?? ""

  const submit = handleSubmit((values) =>
    onSubmit({
      productId: values.productId,
      productName: productName(values.productId),
      reorderPoint: values.reorderPoint,
      quantity: values.quantity ?? 0,
    }),
  )

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open={open}>
      <ModalHeader
        title={isEdit ? "Edit inventory" : "Add inventory"}
        detail={isEdit ? formatInventoryId(String(item.id)) : undefined}
        onClose={onClose}
      />
      <ModalBody>
        {isEdit ? (
          <FormField label="Product">
            <FormInput className="capitalize" disabled value={item.name} />
          </FormField>
        ) : (
          <>
            <FormField label="Product" error={errors.productId?.message}>
              <Controller
                control={control}
                name="productId"
                render={({ field }) => (
                  <EntityDropdown
                    options={products.map((product) => ({
                      id: product.id,
                      label: product.name,
                      sublabel: `${product.categoryName} · ${formatPeso(product.price)}`,
                    }))}
                    value={productName(field.value)}
                    placeholder="Select a product"
                    emptyLabel={productsError ? "Failed to load products. Try searching again." : "No products found."}
                    addHref="/dashboard/product"
                    addLabel="Add product"
                    isLoading={productsLoading}
                    searchPlaceholder="Search products..."
                    onSelect={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField label="Quantity" error={errors.quantity?.message}>
              <FormInput
                aria-invalid={!!errors.quantity}
                min={1}
                type="number"
                {...register("quantity", { valueAsNumber: true })}
              />
            </FormField>
          </>
        )}

        <FormField label="Reorder point" error={errors.reorderPoint?.message}>
          <FormInput
            aria-invalid={!!errors.reorderPoint}
            min={1}
            type="number"
            {...register("reorderPoint", { valueAsNumber: true })}
          />
        </FormField>
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={submit}
        confirmLabel={isEdit ? "Save changes" : "Add inventory"}
        confirmIcon={isEdit ? undefined : Plus}
        confirmDisabled={!isValid || disabled}
      />
    </AppModal>
  )
}
