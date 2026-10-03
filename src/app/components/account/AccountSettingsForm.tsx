'use client'

import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Loading from '@/app/components/loaders/Loading'
import { useCurrentUser } from '@/app/hooks/useCurrentUser'
import { fetchCredentials, updateAccountCredentials, updateProfileInfo } from '@/app/services/accountApi'
import { queryKeys } from '@/app/utils/query/queryKeys'
import type { CurrentUser } from '@/app/types/profile'
import type { CredentialsInfo } from '@/app/types/account'

const MIN_PASSWORD_LENGTH = 8

export default function AccountSettingsForm() {
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useCurrentUser()
  const { data: credentials, isLoading: isLoadingCredentials } = useQuery({
    queryKey: queryKeys.profile.info,
    queryFn: fetchCredentials,
  })

  if (isLoadingCurrentUser || isLoadingCredentials || !currentUser || !credentials) {
    return (
      <section className="flex w-full items-center justify-center rounded-2xl bg-white p-10">
        <Loading />
      </section>
    )
  }

  // Keyed so a different logged-in user (unlikely mid-session, but safe) remounts with fresh initial values.
  return <AccountSettingsFormFields key={currentUser.id} currentUser={currentUser} credentials={credentials} />
}

function AccountSettingsFormFields({
  currentUser,
  credentials,
}: {
  currentUser: CurrentUser
  credentials: CredentialsInfo
}) {
  const queryClient = useQueryClient()

  const [profileForm, setProfileForm] = useState({ firstName: currentUser.firstName, lastName: currentUser.lastName })
  const [credentialsForm, setCredentialsForm] = useState({
    currentPassword: '',
    email: credentials.email,
    password: '',
    confirmPassword: '',
  })

  const updateProfileMutation = useMutation({
    mutationFn: updateProfileInfo,
    onSuccess: (_result, variables) => {
      queryClient.setQueryData<CurrentUser | null>(queryKeys.auth.currentUser, (current) =>
        current ? { ...current, firstName: variables.firstName, lastName: variables.lastName } : current
      )
      toast.success('Profile information updated successfully')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update profile information'),
  })

  const updateCredentialsMutation = useMutation({
    mutationFn: updateAccountCredentials,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.info })
      setCredentialsForm((prev) => ({ ...prev, currentPassword: '', password: '', confirmPassword: '' }))
      toast.success('Account settings updated successfully')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update account settings'),
  })

  const profileChanged =
    profileForm.firstName.trim() !== currentUser.firstName || profileForm.lastName.trim() !== currentUser.lastName
  const profileCanSubmit = profileForm.firstName.trim() !== '' && profileForm.lastName.trim() !== '' && profileChanged

  const passwordProvided = credentialsForm.password !== '' || credentialsForm.confirmPassword !== ''
  const passwordValid =
    !passwordProvided ||
    (credentialsForm.password.length >= MIN_PASSWORD_LENGTH && credentialsForm.password === credentialsForm.confirmPassword)
  const emailChanged = credentialsForm.email.trim() !== credentials.email
  const credentialsCanSubmit =
    credentialsForm.currentPassword !== '' &&
    credentialsForm.email.trim() !== '' &&
    passwordValid &&
    (emailChanged || passwordProvided)

  function handleProfileSubmit(event: FormEvent) {
    event.preventDefault()
    if (!profileCanSubmit) return

    updateProfileMutation.mutate({
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
    })
  }

  function handleCredentialsSubmit(event: FormEvent) {
    event.preventDefault()
    if (!credentialsCanSubmit) return

    updateCredentialsMutation.mutate({
      currentPassword: credentialsForm.currentPassword,
      email: credentialsForm.email.trim(),
      password: passwordProvided ? credentialsForm.password : undefined,
    })
  }

  const fieldLabelColumn = 'grid-cols-[150px_1fr]'

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-2xl bg-white">
      <div className="flex justify-center p-5">
        <form onSubmit={handleProfileSubmit} className="flex w-full max-w-md flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium text-[#121514]">Profile Information</h2>
            <p className="text-sm text-[#737A76]">Update the name shown across the app.</p>
          </div>

          <label className={`grid ${fieldLabelColumn} items-center gap-3 text-sm text-[#121514]`}>
            <span className="text-[#68716C]">First Name</span>
            <Input
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => setProfileForm((prev) => ({ ...prev, firstName: event.target.value }))}
              value={profileForm.firstName}
            />
          </label>

          <label className={`grid ${fieldLabelColumn} items-center gap-3 text-sm text-[#121514]`}>
            <span className="text-[#68716C]">Last Name</span>
            <Input
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => setProfileForm((prev) => ({ ...prev, lastName: event.target.value }))}
              value={profileForm.lastName}
            />
          </label>

          <div className={`grid ${fieldLabelColumn} gap-3`}>
            <span />
            <div className="flex justify-end">
              <Button
                className="rounded-xl px-3 py-2 text-sm"
                disabled={!profileCanSubmit || updateProfileMutation.isPending}
                type="submit"
              >
                Save changes
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="border-t border-[#E2E2E2]" />

      <div className="flex justify-center p-5">
        <form onSubmit={handleCredentialsSubmit} className="flex w-full max-w-md flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium text-[#121514]">Account Settings</h2>
            <p className="text-sm text-[#737A76]">Update your login email or password.</p>
          </div>

          <label className={`grid ${fieldLabelColumn} items-center gap-3 text-sm text-[#121514]`}>
            <span className="text-[#68716C]">Email</span>
            <Input
              type="email"
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => setCredentialsForm((prev) => ({ ...prev, email: event.target.value }))}
              value={credentialsForm.email}
            />
          </label>

          <label className={`grid ${fieldLabelColumn} items-center gap-3 text-sm text-[#121514]`}>
            <span className="text-[#68716C]">Current Password</span>
            <Input
              type="password"
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => setCredentialsForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
              value={credentialsForm.currentPassword}
            />
          </label>

          <label className={`grid ${fieldLabelColumn} items-center gap-3 text-sm text-[#121514]`}>
            <span className="text-[#68716C]">Password</span>
            <Input
              type="password"
              placeholder="Leave blank to keep current password"
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => setCredentialsForm((prev) => ({ ...prev, password: event.target.value }))}
              value={credentialsForm.password}
            />
          </label>

          <label className={`grid ${fieldLabelColumn} items-center gap-3 text-sm text-[#121514]`}>
            <span className="text-[#68716C]">Confirm Password</span>
            <Input
              type="password"
              placeholder="Leave blank to keep current password"
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => setCredentialsForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              value={credentialsForm.confirmPassword}
            />
          </label>

          {passwordProvided && !passwordValid ? (
            <div className={`grid ${fieldLabelColumn} gap-3`}>
              <span />
              <span className="text-xs text-red-500">
                Password must be at least {MIN_PASSWORD_LENGTH} characters and match the confirmation.
              </span>
            </div>
          ) : null}

          <div className={`grid ${fieldLabelColumn} gap-3`}>
            <span />
            <div className="flex justify-end">
              <Button
                className="rounded-xl px-3 py-2 text-sm"
                disabled={!credentialsCanSubmit || updateCredentialsMutation.isPending}
                type="submit"
              >
                Save changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
