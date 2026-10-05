'use client'

import { LogOut, Settings, X } from 'lucide-react'
import { useEffect } from 'react'
import type { StaffProfile } from '@/types/profile'
import { formatProfileDetails, formatProfileName } from '@/app/dashboard/_lib/profileHelpers'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/queryKeys'
import { storeCurrentUser } from '@/services/profileApi'

interface ProfileModalProps {
  isOpen: boolean
  profile: StaffProfile
  onClose: () => void
}

export default function ProfileModal({
  isOpen,
  profile,
  onClose,
}: ProfileModalProps) {

  const router = useRouter()
  const queryClient = useQueryClient()
  async function handleLogout() {
    try {
      const response = await fetch('/api/User/Logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message = payload?.message ?? payload?.title ?? 'Unable to log out.'
        throw new Error(message)
      }

      onClose()
      storeCurrentUser(null)
      queryClient.removeQueries({ queryKey: queryKeys.auth.currentUser })
      toast.success("You're logged out successfully!")
      router.push('/')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to log out. Please try again.')
    }
  }

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      aria-labelledby="profile-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/45 p-4"
      onMouseDown={onClose}
      role="dialog"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="profile-modal-title" className="text-xl font-semibold text-[#0c0d0d]">Profile</h2>
          <button aria-label="Close profile" className="rounded-lg p-2 text-[#0c0d0d] hover:bg-[#F0F1F1]" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div>
            <p className="text-lg font-semibold text-[#0c0d0d]">{formatProfileName(profile)}</p>
            <p className="text-sm text-[#747574] capitalize">{formatProfileDetails(profile)}</p>
          </div>
        </div>

        <div className='flex mt-8 gap-2'>
          {/* <button */}
          {/*   aria-label="Settings" */}
          {/*   className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c0d0d] px-4 py-3 font-medium text-white cursor-pointer transition-all hover:scale-105 duration-300" */}
          {/*   onClick={() => { */}
          {/*     onClose() */}
          {/*     router.push('/dashboard/account-settings') */}
          {/*   }} */}
          {/*   type="button" */}
          {/* > */}
          {/*   <Settings className="h-5 w-5" /> */}
          {/*   Settings */}
          {/* </button> */}

          <button
            aria-label="Log out"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c0d0d] px-4 py-3 font-medium text-white cursor-pointer transition-all hover:scale-105 duration-300"
            onClick={handleLogout}
            type="button"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
