'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AppModal, { ModalActions, ModalBody, ModalHeader } from '@/components/AppModal'
import { FormField, FormInput } from '@/components/FormField'
import type { AccountListItem } from '@/types/account'
import RoleSelect from './RoleSelect'

const MIN_PASSWORD_LENGTH = 8

export interface NewAccount {
  firstName: string
  lastName: string
  email: string
  password: string
  role: AccountListItem['role']
}

interface CreateAccountModalProps {
  disabled: boolean
  onClose: () => void
  onSubmit: (account: NewAccount) => void
}

// Render only while open so the fields start empty each time.
export default function CreateAccountModal({ disabled, onClose, onSubmit }: CreateAccountModalProps) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'secretary' as AccountListItem['role'],
  })

  const canSubmit =
    form.firstName.trim() !== '' &&
    form.lastName.trim() !== '' &&
    form.email.trim() !== '' &&
    form.password.length >= MIN_PASSWORD_LENGTH &&
    form.password === form.confirmPassword &&
    !disabled

  function updateField(field: 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword') {
    return (event: { target: { value: string } }) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    })
  }

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open>
      <ModalHeader subtitle="New account" title="Create account" onClose={onClose} />
      <ModalBody>
        <FormField label="First Name">
          <FormInput onChange={updateField('firstName')} value={form.firstName} />
        </FormField>
        <FormField label="Last Name">
          <FormInput onChange={updateField('lastName')} value={form.lastName} />
        </FormField>
        <FormField label="Email">
          <FormInput type="email" onChange={updateField('email')} value={form.email} />
        </FormField>
        <FormField label="Password">
          <FormInput type="password" onChange={updateField('password')} value={form.password} />
        </FormField>
        <FormField label="Confirm Password">
          <FormInput type="password" onChange={updateField('confirmPassword')} value={form.confirmPassword} />
        </FormField>
        <FormField label="Role">
          <RoleSelect value={form.role} onChange={(role) => setForm((prev) => ({ ...prev, role }))} />
        </FormField>
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={handleSubmit}
        confirmLabel="Create account"
        confirmIcon={Plus}
        confirmDisabled={!canSubmit}
      />
    </AppModal>
  )
}
