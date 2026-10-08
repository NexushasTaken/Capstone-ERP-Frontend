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
import { useSelectableWarehouses } from "../_hooks/useInventory"
import { inventorySchema, type InventoryFields } from "../_lib/inventorySchema"

export interface InventoryFormValues {
  productId: number
  /** For the optimistic row; the API names the item after its product. */
  productName: string
  warehouseId: number
  warehouseName: string | null
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
      warehouseId: item?.warehouseId,
      reorderPoint: item?.reorderPoint,
      quantity: item?.quantity,
    },
  })
  const { products, isLoading: productsLoading, error: productsError } = useInventoryProductSearch(open && !isEdit)
  const { warehouses, isLoading: warehousesLoading } = useSelectableWarehouses(open && !isEdit)

  const productName = (id?: number) => products.find((product) => product.id === id)?.name ?? ""
  const warehouseName = (id?: number) => warehouses.find((warehouse) => warehouse.id === id)?.name ?? null

  const submit = handleSubmit((values) =>
    onSubmit({
      productId: values.productId,
      productName: productName(values.productId),
      warehouseId: values.warehouseId,
      warehouseName: warehouseName(values.warehouseId),
      reorderPoint: values.reorderPoint,
      quantity: values.quantity ?? 0,
    }),
  )

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open={open}>
      <ModalHeader
        subtitle={isEdit ? formatInventoryId(String(item.id)) : "New stock entry"}
        title={isEdit ? "Edit inventory" : "Add inventory"}
        onClose={onClose}
      />
      <ModalBody>
        {isEdit ? (
          <>
            <FormField label="Product">
              <FormInput className="capitalize" disabled value={item.name} />
            </FormField>
            <FormField label="Warehouse">
              <FormInput className="capitalize" disabled value={item.warehouseName} />
            </FormField>
          </>
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

            <FormField label="Warehouse" error={errors.warehouseId?.message}>
              <Controller
                control={control}
                name="warehouseId"
                render={({ field }) => (
                  <EntityDropdown
                    options={warehouses.map((warehouse) => ({
                      id: warehouse.id,
                      label: warehouse.name,
                      sublabel: warehouse.address,
                    }))}
                    value={warehouseName(field.value) ?? ""}
                    placeholder="Select a warehouse"
                    emptyLabel="No warehouses found."
                    addHref="/dashboard/warehouse"
                    addLabel="Add warehouse"
                    isLoading={warehousesLoading}
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
