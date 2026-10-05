'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AppModal, { ModalActions, ModalHeader } from '@/components/AppModal'
import { FormField, FormInput } from '@/components/FormField'
import type { DriverListItem } from '@/types/driver'
import { formatDriverId } from '../_lib/driverHelpers'

interface DriverFormModalProps {
  /** The driver being updated, or `null` to add a new one. */
  driver: DriverListItem | null
  disabled: boolean
  onClose: () => void
  onSubmit: (values: { firstName: string; lastName: string }) => void
}

// Add and update share this modal. Render it only while open so the fields start fresh each time.
export default function DriverFormModal({ driver, disabled, onClose, onSubmit }: DriverFormModalProps) {
  const [form, setForm] = useState({ firstName: driver?.firstName ?? '', lastName: driver?.lastName ?? '' })
  const isEdit = driver !== null
  const canSubmit = form.firstName.trim() !== '' && form.lastName.trim() !== '' && !disabled

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open>
      <ModalHeader
        subtitle={isEdit ? formatDriverId(driver.id) : 'New driver'}
        title={isEdit ? 'Update driver' : 'Add driver'}
        onClose={onClose}
      />
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <FormField label="First name">
          <FormInput
            className="capitalize"
            onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
            value={form.firstName}
          />
        </FormField>
        <FormField label="Last name">
          <FormInput
            className="capitalize"
            onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
            value={form.lastName}
          />
        </FormField>
      </div>
      <ModalActions
        onCancel={onClose}
        onConfirm={() => canSubmit && onSubmit({ firstName: form.firstName.trim(), lastName: form.lastName.trim() })}
        confirmLabel={isEdit ? 'Update driver' : 'Add driver'}
        confirmIcon={isEdit ? undefined : Plus}
        confirmDisabled={!canSubmit}
      />
    </AppModal>
  )
}
