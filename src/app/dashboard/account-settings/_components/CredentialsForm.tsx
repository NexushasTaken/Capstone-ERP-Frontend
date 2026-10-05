"use client"

import { useState, type FormEvent } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { updateAccountCredentials } from "@/services/accountApi"
import { queryKeys } from "@/lib/query/queryKeys"
import type { CredentialsInfo } from "@/types/account"
import { SaveButton, SettingsField, SettingsHeading, SettingsRow } from "./SettingsField"

const MIN_PASSWORD_LENGTH = 8

export default function CredentialsForm({ credentials }: { credentials: CredentialsInfo }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    currentPassword: "",
    email: credentials.email,
    password: "",
    confirmPassword: "",
  })

  const updateCredentialsMutation = useMutation({
    mutationFn: updateAccountCredentials,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.info })
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        password: "",
        confirmPassword: "",
      }))
      toast.success("Account settings updated successfully")
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update account settings"),
  })

  const passwordProvided = form.password !== "" || form.confirmPassword !== ""
  const passwordValid =
    !passwordProvided || (form.password.length >= MIN_PASSWORD_LENGTH && form.password === form.confirmPassword)
  const emailChanged = form.email.trim() !== credentials.email
  const canSubmit =
    form.currentPassword !== "" && form.email.trim() !== "" && passwordValid && (emailChanged || passwordProvided)

  function updateField(field: keyof typeof form) {
    return (value: string) => setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    updateCredentialsMutation.mutate({
      currentPassword: form.currentPassword,
      email: form.email.trim(),
      password: passwordProvided ? form.password : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4">
      <SettingsHeading title="Account Settings" description="Update your login email or password." />
      <SettingsField label="Email" type="email" value={form.email} onChange={updateField("email")} />
      <SettingsField
        label="Current Password"
        type="password"
        value={form.currentPassword}
        onChange={updateField("currentPassword")}
      />
      <SettingsField
        label="Password"
        type="password"
        placeholder="Leave blank to keep current password"
        value={form.password}
        onChange={updateField("password")}
      />
      <SettingsField
        label="Confirm Password"
        type="password"
        placeholder="Leave blank to keep current password"
        value={form.confirmPassword}
        onChange={updateField("confirmPassword")}
      />

      {passwordProvided && !passwordValid ? (
        <SettingsRow>
          <span className="text-xs text-destructive">
            Password must be at least {MIN_PASSWORD_LENGTH} characters and match the confirmation.
          </span>
        </SettingsRow>
      ) : null}

      <SaveButton disabled={!canSubmit || updateCredentialsMutation.isPending} />
    </form>
  )
}
