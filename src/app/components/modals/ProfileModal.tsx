'use client'

import { LogOut, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect } from 'react'
import type { StaffProfile } from '@/app/types/profile'
import { formatProfileDetails } from '@/app/utils/profileHelpers'

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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"
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
          <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#F2F0F0]">
            <Image alt={`${profile.firstName} profile`} className="object-cover" fill sizes="64px" src={profile.avatarSrc} />
          </span>
          <div>
            <p className="text-lg font-semibold text-[#0c0d0d]">{profile.firstName}</p>
            <p className="text-sm text-[#747574]">{formatProfileDetails(profile)}</p>
          </div>
        </div>

        <button
          aria-label="Log out"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c0d0d] px-4 py-3 font-medium text-white"
          type="button"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </div>
  )
}
