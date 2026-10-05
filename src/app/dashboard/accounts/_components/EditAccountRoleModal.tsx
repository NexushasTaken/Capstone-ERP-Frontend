'use client'

import { useState } from 'react'
import AppModal, { ModalActions, ModalBody, ModalHeader } from '@/components/AppModal'
import { FormField } from '@/components/FormField'
import type { AccountListItem } from '@/types/account'
import { formatAccountId, LOCKED_ACCOUNT_ID } from '../_lib/accountHelpers'
import RoleSelect from './RoleSelect'

interface EditAccountRoleModalProps {
  account: AccountListItem
  disabled: boolean
  onClose: () => void
  onSubmit: (role: AccountListItem['role']) => void
}

export default function EditAccountRoleModal({ account, disabled, onClose, onSubmit }: EditAccountRoleModalProps) {
  const [role, setRole] = useState(account.role)
  const isLocked = account.id === LOCKED_ACCOUNT_ID
  const canSubmit = !isLocked && role !== account.role && !disabled

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open>
      <ModalHeader subtitle={formatAccountId(account.id)} title="Edit account" onClose={onClose} />
      <ModalBody>
        <div className="flex flex-col">
          <span className="font-medium text-[#0c0d0d] capitalize">
            {`${account.lastName}, ${account.firstName}`}
          </span>
          <span className="text-sm text-[#ACABAA]">{account.email}</span>
        </div>

        <FormField label="Role">
          <RoleSelect value={role} onChange={setRole} disabled={isLocked} />
          {isLocked && (
            <span className="text-xs text-[#ACABAA]">This account&apos;s role cannot be changed.</span>
          )}
        </FormField>
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={() => canSubmit && onSubmit(role)}
        confirmLabel="Save changes"
        confirmDisabled={!canSubmit}
      />
    </AppModal>
  )
}
