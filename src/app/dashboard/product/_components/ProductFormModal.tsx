'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import AppModal, { ModalActions, ModalBody, ModalHeader } from '@/components/AppModal'
import EntityDropdown from '@/components/EntityDropdown'
import { FormField, FormInput } from '@/components/FormField'
import { fetchCategories } from '@/services/categoryApi'
import { queryKeys } from '@/lib/query/queryKeys'
import type { ProductListItem } from '@/types/product'
import type { ProductValues } from '../_hooks/useProducts'
import { formatProductId } from '../_lib/productHelpers'

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
  const [form, setForm] = useState({
    name: product?.name ?? '',
    categoryId: product?.categoryId ? String(product.categoryId) : '',
    price: product ? String(product.price) : '',
  })
  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: queryKeys.categories.all(ALL_CATEGORIES),
    queryFn: () => fetchCategories(ALL_CATEGORIES),
  })

  const isEdit = product !== null
  const categories = categoriesResponse?.items ?? []
  const categoryOptions = [
    { id: 0, label: 'No category' },
    ...categories.map((category) => ({
      id: category.id,
      label: category.type,
      sublabel: `ID: ${category.id}`,
    })),
  ]
  const selectedCategoryName = categories.find((category) => category.id === Number(form.categoryId))?.type ?? null
  const canSubmit = form.name.trim() !== '' && form.price.trim() !== '' && Number(form.price) > 0 && !disabled

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit({
      name: form.name.trim(),
      price: Number(form.price),
      categoryId: form.categoryId ? Number(form.categoryId) : 0,
      categoryName: selectedCategoryName,
    })
  }

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open>
      <ModalHeader
        subtitle={isEdit ? formatProductId(product.id) : 'New product item'}
        title={isEdit ? 'Edit product' : 'Add product'}
        onClose={onClose}
      />
      <ModalBody>
        <FormField label="Product name">
          <FormInput
            className="capitalize"
            onChange={(event) => updateField('name', event.target.value)}
            value={form.name}
          />
        </FormField>

        <FormField label="Category">
          <EntityDropdown
            emptyLabel="No categories found"
            isLoading={categoriesLoading}
            onSelect={(categoryId) => updateField('categoryId', categoryId === 0 ? '' : String(categoryId))}
            options={categoryOptions}
            placeholder="No category"
            searchPlaceholder="Search categories..."
            value={form.categoryId === '0' ? 'No category' : (selectedCategoryName ?? '')}
          />
        </FormField>

        <FormField label="Price">
          <FormInput
            min={1}
            onChange={(event) => updateField('price', event.target.value)}
            type="number"
            value={form.price}
          />
        </FormField>
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={handleSubmit}
        confirmLabel={isEdit ? 'Save changes' : 'Add product'}
        confirmIcon={isEdit ? undefined : Plus}
        confirmDisabled={!canSubmit}
      />
    </AppModal>
  )
}
