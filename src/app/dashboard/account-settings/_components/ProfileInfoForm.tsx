"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { updateProfileInfo } from "@/services/accountApi"
import { applyServerErrors } from "@/lib/applyServerErrors"
import { queryKeys } from "@/lib/query/queryKeys"
import type { CurrentUser } from "@/types/profile"
import { profileSchema, type ProfileFormValues } from "../_lib/settingsSchema"
import { SaveButton, SettingsField, SettingsHeading } from "./SettingsField"

export default function ProfileInfoForm({ currentUser }: { currentUser: CurrentUser }) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    defaultValues: { firstName: currentUser.firstName, lastName: currentUser.lastName },
  })

  const updateProfileMutation = useMutation({
    mutationFn: updateProfileInfo,
    onSuccess: (_result, variables) => {
      queryClient.setQueryData<CurrentUser | null>(queryKeys.auth.currentUser, (current) =>
        current
          ? {
              ...current,
              firstName: variables.firstName,
              lastName: variables.lastName,
            }
          : current,
      )
      // The saved values become the new baseline for "changed".
      reset(variables)
      toast.success("Profile information updated successfully")
    },
    onError: (err) => {
      if (applyServerErrors(err, setError)) return
      toast.error(err instanceof Error ? err.message : "Failed to update profile information")
    },
  })

  return (
    <form
      onSubmit={handleSubmit((values) => updateProfileMutation.mutate(values))}
      className="flex w-full max-w-md flex-col gap-4"
    >
      <SettingsHeading title="Profile Information" description="Update the name shown across the app." />
      <SettingsField label="First Name" error={errors.firstName?.message} {...register("firstName")} />
      <SettingsField label="Last Name" error={errors.lastName?.message} {...register("lastName")} />
      <SaveButton disabled={!isValid || !isDirty || updateProfileMutation.isPending} />
    </form>
  )
}
