'use client'

import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateProfileInfo } from '@/services/accountApi'
import { queryKeys } from '@/lib/query/queryKeys'
import type { CurrentUser } from '@/types/profile'
import { SaveButton, SettingsField, SettingsHeading } from './SettingsField'

export default function ProfileInfoForm({ currentUser }: { currentUser: CurrentUser }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
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
      toast.success('Profile information updated successfully')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update profile information'),
  })

  const changed = form.firstName.trim() !== currentUser.firstName || form.lastName.trim() !== currentUser.lastName
  const canSubmit = form.firstName.trim() !== '' && form.lastName.trim() !== '' && changed

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    updateProfileMutation.mutate({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4">
      <SettingsHeading title="Profile Information" description="Update the name shown across the app." />
      <SettingsField
        label="First Name"
        value={form.firstName}
        onChange={(firstName) => setForm((prev) => ({ ...prev, firstName }))}
      />
      <SettingsField
        label="Last Name"
        value={form.lastName}
        onChange={(lastName) => setForm((prev) => ({ ...prev, lastName }))}
      />
      <SaveButton disabled={!canSubmit || updateProfileMutation.isPending} />
    </form>
  )
}
