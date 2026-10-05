"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import AppModal, { ModalActions, ModalBody, ModalHeader } from "@/components/AppModal"
import { DatePickerSimple } from "@/components/DatePicker"
import EntityDropdown from "@/components/EntityDropdown"
import { FormField, FormInput } from "@/components/FormField"
import { useInventoryProductSearch } from "@/hooks/useInventoryProductSearch"
import { formatPeso } from "@/lib/format"
import { formatDateForApi, formatInventoryId } from "@/lib/helpers/inventoryHelpers"
import type { InventoryListItem } from "@/types/inventory"
import { useSelectableWarehouses } from "../_hooks/useInventory"
import { inventorySchema, type InventoryFields } from "../_lib/inventorySchema"

export interface InventoryFormValues {
  name: string
  productId: number
  warehouseId: number
  warehouseName: string | null
  reorderPoint: number
  /** Only set when adding. */
  quantity: number
  /** Only set when adding. */
  dateArrived: string
}

interface InventoryFormModalProps {
  open: boolean
  /** The item being edited, or `null` to add a new one (adding also asks for quantity and arrival date). */
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
      name: item?.name ?? "",
      productId: item?.productId,
      warehouseId: item?.warehouseId,
      reorderPoint: item?.reorderPoint,
      quantity: item?.quantity,
      dateArrived: item?.dateArrived ?? "",
    },
  })
  const { products, isLoading: productsLoading, error: productsError } = useInventoryProductSearch(open)
  const { warehouses, isLoading: warehousesLoading } = useSelectableWarehouses(open)

  const productName = (id?: number) => products.find((product) => product.id === id)?.name ?? ""
  const warehouseName = (id?: number) => warehouses.find((warehouse) => warehouse.id === id)?.name ?? null

  const submit = handleSubmit((values) =>
    onSubmit({
      name: values.name,
      productId: values.productId,
      warehouseId: values.warehouseId,
      warehouseName: warehouseName(values.warehouseId),
      reorderPoint: values.reorderPoint,
      quantity: values.quantity ?? 0,
      dateArrived: isEdit ? (values.dateArrived ?? "") : formatDateForApi(values.dateArrived ?? ""),
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
        <FormField label="Name" error={errors.name?.message}>
          <FormInput aria-invalid={!!errors.name} className={isEdit ? "" : "capitalize"} {...register("name")} />
        </FormField>

        {!isEdit && (
          <FormField label="Quantity" error={errors.quantity?.message}>
            <FormInput
              aria-invalid={!!errors.quantity}
              min={1}
              type="number"
              {...register("quantity", { valueAsNumber: true })}
            />
          </FormField>
        )}

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

        {!isEdit && (
          <Controller
            control={control}
            name="dateArrived"
            render={({ field, fieldState }) => (
              <DatePickerSimple
                label="Date arrived"
                value={field.value ?? ""}
                onChange={(value) => {
                  field.onChange(value)
                  field.onBlur()
                }}
                error={fieldState.error?.message}
              />
            )}
          />
        )}

        <FormField label="Reorder point" error={errors.reorderPoint?.message}>
          <FormInput
            aria-invalid={!!errors.reorderPoint}
            min={0}
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
