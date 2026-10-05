'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AppModal, { ModalActions, ModalBody, ModalHeader } from '@/components/AppModal'
import { FormField, FormInput } from '@/components/FormField'
import type { CategoryListItem } from '@/types/category'
import { formatCategoryId } from '../_lib/categoryHelpers'

interface CategoryFormModalProps {
  /** The category being edited, or `null` to add a new one. */
  category: CategoryListItem | null
  disabled: boolean
  onClose: () => void
  onSubmit: (categoryName: string) => void
}

// Add and edit share this modal. Render it only while open so the field starts fresh each time.
export default function CategoryFormModal({ category, disabled, onClose, onSubmit }: CategoryFormModalProps) {
  const [name, setName] = useState(category?.type ?? '')
  const isEdit = category !== null
  const canSubmit = name.trim() !== '' && !disabled

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open>
      <ModalHeader
        subtitle={isEdit ? formatCategoryId(category.id) : 'New category item'}
        title={isEdit ? 'Edit category' : 'Add category'}
        onClose={onClose}
      />
      <ModalBody>
        <FormField label="Category name">
          <FormInput className="capitalize" onChange={(event) => setName(event.target.value)} value={name} />
        </FormField>
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={() => canSubmit && onSubmit(name.trim())}
        confirmLabel={isEdit ? 'Save changes' : 'Add category'}
        confirmIcon={isEdit ? undefined : Plus}
        confirmDisabled={!canSubmit}
      />
    </AppModal>
  )
}
