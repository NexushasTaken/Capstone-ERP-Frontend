"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { updateAccountCredentials } from "@/services/accountApi"
import { ApiError } from "@/lib/apiError"
import { applyServerErrors } from "@/lib/applyServerErrors"
import { queryKeys } from "@/lib/query/queryKeys"
import type { CredentialsInfo } from "@/types/account"
import { credentialsSchema, type CredentialsFormValues } from "../_lib/settingsSchema"
import { SaveButton, SettingsField, SettingsHeading, SettingsRow } from "./SettingsField"

export default function CredentialsForm({ credentials }: { credentials: CredentialsInfo }) {
  const queryClient = useQueryClient()
  const {
    register,
    control,
    handleSubmit,
    resetField,
    setError,
    formState: { errors, isValid },
  } = useForm<CredentialsFormValues>({
    resolver: zodResolver(credentialsSchema),
    mode: "onTouched",
    defaultValues: { currentPassword: "", email: credentials.email, password: "", confirmPassword: "" },
  })
  const [email, password] = useWatch({ control, name: ["email", "password"] })

  const updateCredentialsMutation = useMutation({
    mutationFn: updateAccountCredentials,
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.info })
      resetField("email", { defaultValue: variables.email })
      resetField("currentPassword")
      resetField("password")
      resetField("confirmPassword")
      toast.success("Account settings updated successfully")
    },
    onError: (err) => {
      // The user is signed in, so a 401 here means the current password was wrong.
      if (err instanceof ApiError && err.status === 401) {
        setError("currentPassword", { message: err.message }, { shouldFocus: true })
        return
      }
      if (applyServerErrors(err, setError)) return
      toast.error(err instanceof Error ? err.message : "Failed to update account settings")
    },
  })

  const emailChanged = email.trim() !== credentials.email
  const canSubmit = isValid && (emailChanged || password !== "") && !updateCredentialsMutation.isPending

  return (
    <form
      onSubmit={handleSubmit(({ currentPassword, email, password }) =>
        updateCredentialsMutation.mutate({ currentPassword, email, password: password || undefined }),
      )}
      className="flex w-full max-w-md flex-col gap-4"
    >
      <SettingsHeading title="Account Settings" description="Update your login email or password." />
      <SettingsField label="Email" type="email" error={errors.email?.message} {...register("email")} />
      <SettingsField
        label="Current Password"
        type="password"
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />
      <SettingsField
        label="Password"
        type="password"
        placeholder="Leave blank to keep current password"
        error={errors.password?.message}
        {...register("password", { deps: ["confirmPassword"] })}
      />
      <SettingsField
        label="Confirm Password"
        type="password"
        placeholder="Leave blank to keep current password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      {errors.root?.server && (
        <SettingsRow>
          <span className="text-xs text-destructive">{errors.root.server.message}</span>
        </SettingsRow>
      )}
      <SaveButton disabled={!canSubmit} />
    </form>
  )
}
