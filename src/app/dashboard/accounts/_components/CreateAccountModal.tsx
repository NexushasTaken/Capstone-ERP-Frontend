"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import AppModal, { ModalActions, ModalBody, ModalHeader } from "@/components/AppModal"
import { FormField, FormInput } from "@/components/FormField"
import { applyServerErrors } from "@/lib/applyServerErrors"
import type { AccountListItem } from "@/types/account"
import { createAccountSchema, type CreateAccountFormValues } from "../_lib/accountSchema"
import RoleSelect from "./RoleSelect"

export interface NewAccount {
  firstName: string
  lastName: string
  email: string
  password: string
  role: AccountListItem["role"]
}

const EMPTY_FORM: CreateAccountFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "secretary",
}

interface CreateAccountModalProps {
  open: boolean
  disabled: boolean
  onClose: () => void
  // Resolves when the account was created, rejects with the backend's error otherwise.
  onSubmit: (account: NewAccount) => Promise<void>
}

// Stays mounted while closed, so the inputs survive closing the modal or a failed submit.
// They're cleared only after the account is created.
export default function CreateAccountModal({ open, disabled, onClose, onSubmit }: CreateAccountModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    mode: "onTouched",
    defaultValues: EMPTY_FORM,
  })

  const submit = handleSubmit(async ({ firstName, lastName, email, password, role }) => {
    if (disabled) return
    try {
      await onSubmit({ firstName, lastName, email, password, role })
      reset(EMPTY_FORM)
    } catch (error) {
      // Rejected inputs go under their fields; other failures are toasted by the mutation.
      applyServerErrors(error, setError)
    }
  })

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open={open}>
      <ModalHeader subtitle="New account" title="Create account" onClose={onClose} />
      <ModalBody>
        <FormField label="First Name" error={errors.firstName?.message}>
          <FormInput aria-invalid={!!errors.firstName} {...register("firstName")} />
        </FormField>
        <FormField label="Last Name" error={errors.lastName?.message}>
          <FormInput aria-invalid={!!errors.lastName} {...register("lastName")} />
        </FormField>
        <FormField label="Email" error={errors.email?.message}>
          <FormInput aria-invalid={!!errors.email} type="email" {...register("email")} />
        </FormField>
        <FormField label="Password" error={errors.password?.message}>
          <FormInput
            aria-invalid={!!errors.password}
            type="password"
            {...register("password", { deps: ["confirmPassword"] })}
          />
        </FormField>
        <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
          <FormInput aria-invalid={!!errors.confirmPassword} type="password" {...register("confirmPassword")} />
        </FormField>
        <FormField label="Role" error={errors.role?.message}>
          <Controller
            control={control}
            name="role"
            render={({ field }) => <RoleSelect value={field.value} onChange={field.onChange} />}
          />
        </FormField>
        {errors.root?.server && <p className="text-sm text-destructive">{errors.root.server.message}</p>}
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={submit}
        confirmLabel="Create account"
        confirmIcon={Plus}
        confirmDisabled={disabled}
      />
    </AppModal>
  )
}
