"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import AppModal, { ModalActions, ModalBody, ModalHeader } from "@/components/AppModal"
import { FormField, FormInput } from "@/components/FormField"
import { isValidationError } from "@/lib/apiError"
import type { AccountListItem } from "@/types/account"
import RoleSelect from "./RoleSelect"

// Same rules as the backend's AccountValidation, so most mistakes are caught before sending.
const MIN_PASSWORD_LENGTH = 8
const EMAIL_PATTERN = /^[\w.-]+@[\w.-]+\.\w{2,}$/

export interface NewAccount {
  firstName: string
  lastName: string
  email: string
  password: string
  role: AccountListItem["role"]
}

type TextField = "firstName" | "lastName" | "email" | "password" | "confirmPassword"
type FieldErrors = Partial<Record<TextField | "role", string>>

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "secretary" as AccountListItem["role"],
}

interface CreateAccountModalProps {
  open: boolean
  disabled: boolean
  onClose: () => void
  // Resolves when the account was created, rejects with the backend's error otherwise.
  onSubmit: (account: NewAccount) => Promise<void>
}

function validate(form: typeof EMPTY_FORM): FieldErrors {
  const errors: FieldErrors = {}
  if (form.firstName.trim() === "") errors.firstName = "First name is required."
  if (form.lastName.trim() === "") errors.lastName = "Last name is required."
  if (form.email.trim() === "") errors.email = "Email is required."
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = "Email is invalid."
  if (form.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords do not match."
  return errors
}

// The backend returns one message per rejected input. Put it under the field it names.
function fieldForServerMessage(message: string): keyof FieldErrors | null {
  const text = message.toLowerCase()
  if (text.startsWith("first name")) return "firstName"
  if (text.startsWith("last name")) return "lastName"
  if (text.includes("email")) return "email"
  if (text.startsWith("password")) return "password"
  if (text.startsWith("role")) return "role"
  return null
}

// Stays mounted while closed, so the inputs survive closing the modal or a failed submit.
// They're cleared only after the account is created.
export default function CreateAccountModal({ open, disabled, onClose, onSubmit }: CreateAccountModalProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState("")

  function clearError(field: keyof FieldErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setFormError("")
  }

  function updateField(field: TextField) {
    return (event: { target: { value: string } }) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
      clearError(field)
    }
  }

  async function handleSubmit() {
    if (disabled) return

    const clientErrors = validate(form)
    setErrors(clientErrors)
    setFormError("")
    if (Object.keys(clientErrors).length > 0) return

    try {
      await onSubmit({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      })
      setForm(EMPTY_FORM)
    } catch (error) {
      // Other failures are toasted by the mutation; the form keeps its values either way.
      if (!isValidationError(error)) return
      const field = fieldForServerMessage(error.message)
      if (field) setErrors({ [field]: error.message })
      else setFormError(error.message)
    }
  }

  return (
    <AppModal className="flex max-h-fit flex-col lg:max-w-lg" onClose={onClose} open={open}>
      <ModalHeader subtitle="New account" title="Create account" onClose={onClose} />
      <ModalBody>
        <FormField label="First Name" error={errors.firstName}>
          <FormInput aria-invalid={!!errors.firstName} onChange={updateField("firstName")} value={form.firstName} />
        </FormField>
        <FormField label="Last Name" error={errors.lastName}>
          <FormInput aria-invalid={!!errors.lastName} onChange={updateField("lastName")} value={form.lastName} />
        </FormField>
        <FormField label="Email" error={errors.email}>
          <FormInput aria-invalid={!!errors.email} type="email" onChange={updateField("email")} value={form.email} />
        </FormField>
        <FormField label="Password" error={errors.password}>
          <FormInput
            aria-invalid={!!errors.password}
            type="password"
            onChange={updateField("password")}
            value={form.password}
          />
        </FormField>
        <FormField label="Confirm Password" error={errors.confirmPassword}>
          <FormInput
            aria-invalid={!!errors.confirmPassword}
            type="password"
            onChange={updateField("confirmPassword")}
            value={form.confirmPassword}
          />
        </FormField>
        <FormField label="Role" error={errors.role}>
          <RoleSelect
            value={form.role}
            onChange={(role) => {
              setForm((prev) => ({ ...prev, role }))
              clearError("role")
            }}
          />
        </FormField>
        {formError && <p className="text-sm text-destructive">{formError}</p>}
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={handleSubmit}
        confirmLabel="Create account"
        confirmIcon={Plus}
        confirmDisabled={disabled}
      />
    </AppModal>
  )
}
