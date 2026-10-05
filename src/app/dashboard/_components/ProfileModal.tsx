"use client"

import { LogOut, Settings, X } from "lucide-react"
import AppModal, { ModalTitle } from "@/components/AppModal"
import type { StaffProfile } from "@/types/profile"
import { formatProfileDetails, formatProfileName } from "@/app/dashboard/_lib/profileHelpers"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query/queryKeys"
import { storeCurrentUser } from "@/services/profileApi"

interface ProfileModalProps {
  isOpen: boolean
  profile: StaffProfile
  onClose: () => void
}

export default function ProfileModal({ isOpen, profile, onClose }: ProfileModalProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  async function handleLogout() {
    try {
      const response = await fetch("/api/User/Logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message = payload?.message ?? payload?.title ?? "Unable to log out."
        throw new Error(message)
      }

      onClose()
      storeCurrentUser(null)
      queryClient.removeQueries({ queryKey: queryKeys.auth.currentUser })
      toast.success("You're logged out successfully!")
      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to log out. Please try again.")
    }
  }

  return (
    <AppModal
      className="block h-auto max-w-[calc(100%-2rem)] rounded-2xl p-6 shadow-2xl sm:max-w-sm lg:rounded-2xl xl:h-auto"
      onClose={onClose}
      open={isOpen}
    >
      <div className="flex items-center justify-between">
        <ModalTitle className="text-xl font-semibold text-foreground">Profile</ModalTitle>
        <button
          aria-label="Close profile"
          className="rounded-lg p-2 text-foreground hover:bg-accent"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div>
          <p className="text-lg font-semibold text-foreground">{formatProfileName(profile)}</p>
          <p className="text-sm text-muted-foreground capitalize">{formatProfileDetails(profile)}</p>
        </div>
      </div>

      <div className="flex mt-8 gap-2">
        {/* <button */}
        {/*   aria-label="Settings" */}
        {/*   className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground cursor-pointer transition-all hover:scale-105 duration-300" */}
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground cursor-pointer transition-all hover:scale-105 duration-300"
          onClick={handleLogout}
          type="button"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </AppModal>
  )
}
