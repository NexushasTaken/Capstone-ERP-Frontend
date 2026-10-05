'use client'

import { useQuery } from '@tanstack/react-query'
import Loading from '@/components/Loading'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { fetchCredentials } from '@/services/accountApi'
import { queryKeys } from '@/lib/query/queryKeys'
import CredentialsForm from './CredentialsForm'
import ProfileInfoForm from './ProfileInfoForm'

export default function AccountSettingsView() {
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useCurrentUser()
  const { data: credentials, isLoading: isLoadingCredentials } = useQuery({
    queryKey: queryKeys.profile.info,
    queryFn: fetchCredentials,
  })

  if (isLoadingCurrentUser || isLoadingCredentials || !currentUser || !credentials) {
    return (
      <section className="flex w-full items-center justify-center rounded-2xl bg-background p-10">
        <Loading />
      </section>
    )
  }

  // Keyed so a different logged-in user (unlikely mid-session, but safe) remounts the forms with fresh values.
  return (
    <section key={currentUser.id} className="flex w-full flex-col overflow-hidden rounded-2xl bg-background">
      <div className="flex justify-center p-5">
        <ProfileInfoForm currentUser={currentUser} />
      </div>

      <div className="border-t border-border" />

      <div className="flex justify-center p-5">
        <CredentialsForm credentials={credentials} />
      </div>
    </section>
  )
}
