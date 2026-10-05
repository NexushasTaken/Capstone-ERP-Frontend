"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import AppModal, { ModalActions, ModalBody, ModalHeader } from "@/components/AppModal"
import { FormField } from "@/components/FormField"
import type { AccountListItem } from "@/types/account"
import { formatAccountId, LOCKED_ACCOUNT_ID } from "../_lib/accountHelpers"
import { editRoleSchema, type EditRoleFormValues } from "../_lib/accountSchema"
import RoleSelect from "./RoleSelect"

interface EditAccountRoleModalProps {
  account: AccountListItem
  disabled: boolean
  onClose: () => void
  onSubmit: (role: AccountListItem["role"]) => void
}

export default function EditAccountRoleModal({ account, disabled, onClose, onSubmit }: EditAccountRoleModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditRoleFormValues>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: { role: account.role },
  })
  const isLocked = account.id === LOCKED_ACCOUNT_ID
  const canSubmit = !isLocked && isDirty && !disabled

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open>
      <ModalHeader subtitle={formatAccountId(account.id)} title="Edit account" onClose={onClose} />
      <ModalBody>
        <div className="flex flex-col">
          <span className="font-medium text-foreground capitalize">{`${account.lastName}, ${account.firstName}`}</span>
          <span className="text-sm text-muted-foreground">{account.email}</span>
        </div>

        <FormField label="Role" error={errors.role?.message}>
          <Controller
            control={control}
            name="role"
            render={({ field }) => <RoleSelect value={field.value} onChange={field.onChange} disabled={isLocked} />}
          />
          {isLocked && (
            <span className="text-xs text-muted-foreground">This account&apos;s role cannot be changed.</span>
          )}
        </FormField>
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={handleSubmit((values) => canSubmit && onSubmit(values.role))}
        confirmLabel="Save changes"
        confirmDisabled={!canSubmit}
      />
    </AppModal>
  )
}
