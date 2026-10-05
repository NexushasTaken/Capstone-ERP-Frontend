'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AppModal, { ModalActions, ModalBody, ModalHeader } from '@/components/AppModal'
import { DatePickerSimple } from '@/components/DatePicker'
import EntityDropdown from '@/components/EntityDropdown'
import { FormField, FormInput } from '@/components/FormField'
import { useInventoryProductSearch } from '@/hooks/useInventoryProductSearch'
import { formatPeso } from '@/lib/format'
import { formatDateForApi, formatInventoryId } from '@/lib/helpers/inventoryHelpers'
import type { InventoryListItem } from '@/types/inventory'
import { useSelectableWarehouses } from '../_hooks/useInventory'

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
  const [form, setForm] = useState({
    name: item?.name ?? '',
    quantity: item ? String(item.quantity) : '',
    productId: item ? String(item.productId) : '',
    warehouseId: item ? String(item.warehouseId) : '',
    dateArrived: item?.dateArrived ?? '',
    reorderPoint: item ? String(item.reorderPoint) : '',
  })
  const { products, isLoading: productsLoading, error: productsError } = useInventoryProductSearch(open)
  const { warehouses, isLoading: warehousesLoading } = useSelectableWarehouses(open)

  const selectedProductLabel = products.find((product) => String(product.id) === form.productId)?.name ?? ''
  const selectedWarehouse = warehouses.find((warehouse) => String(warehouse.id) === form.warehouseId)
  const commonFieldsValid =
    form.name.trim() !== '' &&
    form.productId.trim() !== '' &&
    form.warehouseId.trim() !== '' &&
    form.reorderPoint.trim() !== '' &&
    Number(form.reorderPoint) >= 0
  const canSubmit =
    !disabled &&
    commonFieldsValid &&
    (isEdit || (form.quantity.trim() !== '' && Number(form.quantity) > 0 && form.dateArrived.trim() !== ''))

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit({
      name: isEdit ? form.name.trim() : form.name,
      productId: Number(form.productId),
      warehouseId: Number(form.warehouseId),
      warehouseName: selectedWarehouse?.name ?? null,
      reorderPoint: Number(form.reorderPoint),
      quantity: Number(form.quantity),
      dateArrived: isEdit ? form.dateArrived : formatDateForApi(form.dateArrived),
    })
  }

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open={open}>
      <ModalHeader
        subtitle={isEdit ? formatInventoryId(String(item.id)) : 'New stock entry'}
        title={isEdit ? 'Edit inventory' : 'Add inventory'}
        onClose={onClose}
      />
      <ModalBody>
        <FormField label="Name">
          <FormInput
            className={isEdit ? '' : 'capitalize'}
            onChange={(event) => updateField('name', event.target.value)}
            value={form.name}
          />
        </FormField>

        {!isEdit && (
          <FormField label="Quantity">
            <FormInput
              min={1}
              onChange={(event) => updateField('quantity', event.target.value)}
              type="number"
              value={form.quantity}
            />
          </FormField>
        )}

        <FormField label="Product">
          <EntityDropdown
            options={products.map((product) => ({
              id: product.id,
              label: product.name,
              sublabel: `${product.categoryName} · ${formatPeso(product.price)}`,
            }))}
            value={selectedProductLabel}
            placeholder="Select a product"
            emptyLabel={productsError ? 'Failed to load products. Try searching again.' : 'No products found.'}
            addHref="/dashboard/product"
            addLabel="Add product"
            isLoading={productsLoading}
            searchPlaceholder="Search products..."
            onSelect={(id) => updateField('productId', String(id))}
          />
        </FormField>

        <FormField label="Warehouse">
          <EntityDropdown
            options={warehouses.map((warehouse) => ({
              id: warehouse.id,
              label: warehouse.name,
              sublabel: warehouse.address,
            }))}
            value={selectedWarehouse?.name ?? ''}
            placeholder="Select a warehouse"
            emptyLabel="No warehouses found."
            addHref="/dashboard/inventory#WarehouseCapacity"
            addLabel="Add warehouse"
            isLoading={warehousesLoading}
            onSelect={(id) => updateField('warehouseId', String(id))}
          />
        </FormField>

        {!isEdit && (
          <DatePickerSimple
            label="Date arrived"
            value={form.dateArrived}
            onChange={(value) => updateField('dateArrived', value)}
          />
        )}

        <FormField label="Reorder point">
          <FormInput
            min={0}
            onChange={(event) => updateField('reorderPoint', event.target.value)}
            type="number"
            value={form.reorderPoint}
          />
        </FormField>
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={handleSubmit}
        confirmLabel={isEdit ? 'Save changes' : 'Add inventory'}
        confirmIcon={isEdit ? undefined : Plus}
        confirmDisabled={!canSubmit}
      />
    </AppModal>
  )
}
