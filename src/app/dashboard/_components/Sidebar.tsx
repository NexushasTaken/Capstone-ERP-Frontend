"use client"

import AuditLogSidebar from "@/app/dashboard/_components/AuditLogSidebar"
import { useLogout } from "@/app/dashboard/_hooks/useLogout"
import { navGroups } from "@/lib/nav"
import { formatProfileDetails, formatProfileName } from "@/app/dashboard/_lib/profileHelpers"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronsUpDown, LayoutDashboard, LogOut, Settings, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import cproLogo from "../../../../public/cproLogo.png"
import { getNavItemClasses, profileFallback } from "@/app/dashboard/_lib/sidebarHelpers"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { can } from "@/lib/permissions"

export interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  // Both groups start expanded; collapsing is a per-visit UI preference, not worth persisting.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const pathname = usePathname()
  const router = useRouter()
  const logout = useLogout()
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useCurrentUser()

  const dashboardActive = pathname === "/dashboard"
  const profile = {
    firstName: currentUser?.firstName ?? profileFallback.firstName,
    lastName: currentUser?.lastName ?? profileFallback.lastName,
    role: currentUser?.role ?? profileFallback.role,
  }
  // Use the real role, never the display fallback, so a missing user gets no links.
  const allowedGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(({ link }) => can(currentUser?.role, link)),
    }))
    .filter((group) => group.items.length > 0)

  const isGroupOpen = (label: string) => openGroups[label] ?? true
  const toggleGroup = (label: string) => setOpenGroups((prev) => ({ ...prev, [label]: !isGroupOpen(label) }))

  return (
    <>
      <aside
        className={`h-dvh scrollbar-none shrink-0 flex-col gap-3 bg-background px-3 xl:pr-0 py-3 overflow-y-auto sm:gap-4 ${
          isOpen
            ? "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,calc(100vw-1.5rem))] shadow-xl sm:w-[min(20rem,calc(100vw-2rem))] xl:static xl:z-auto xl:w-1/5 xl:shadow-none"
            : "hidden xl:flex w-auto xl:w-1/5"
        }`}
      >
        {/* BUTTON NAV - DASHBOARD */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center text-2xl text-foreground font-semibold sm:text-3xl md:text-4xl">
            <div className="relative w-10 h-10 lg:w-20 lg:h-20 rounded-full">
              <Image
                src={cproLogo}
                alt="Cpro Logo"
                className="object-contain"
                fill
                priority
                sizes="(max-width: 1024px) 40px, 80px"
              />
            </div>
            CPro Home
          </span>
          <button
            aria-label="Close navigation"
            className="cursor-pointer p-2 text-foreground xl:hidden"
            onClick={onClose}
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* BUTTON NAV */}
        <div className="flex flex-1 flex-col gap-2 w-full">
          <Link
            href="/dashboard"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer group ${getNavItemClasses(dashboardActive)}`}
          >
            <LayoutDashboard className="h-5 w-5 shrink-0 group-hover:rotate-90 transition-all duration-300" />
            <span className="text-sm font-medium sm:text-base">Dashboard</span>
          </Link>

          <div className="flex flex-col gap-1 w-full">
            {allowedGroups.map(({ label, items }) => {
              const open = isGroupOpen(label)

              return (
                <div key={label} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => toggleGroup(label)}
                    aria-expanded={open}
                    className="flex items-center justify-between w-full rounded-xl px-3 py-2 cursor-pointer text-left text-muted-foreground hover:bg-accent transition-all duration-300"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                  </button>

                  {open && (
                    <div className="flex flex-col gap-0.5 pl-2">
                      {items.map(({ icon: Icon, name, link }) => {
                        const isActive = pathname === link

                        return (
                          <Link
                            key={name}
                            href={link}
                            onClick={onClose}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer group ${getNavItemClasses(isActive)}`}
                          >
                            <Icon className="h-5 w-5 shrink-0 group-hover:rotate-12 transition-all duration-300" />
                            <span className="text-sm font-medium sm:text-base">{name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* AUDIT LOGS */}
        <AuditLogSidebar onNavigate={onClose} />

        {/* PROFILE */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                aria-label="Open account menu"
                className="flex h-16 w-full shrink-0 gap-2 rounded-2xl border-2 border-border p-3 text-left hover:bg-accent cursor-pointer sm:h-20 sm:pr-4"
                type="button"
              />
            }
          >
            <div className="flex flex-col w-full h-full justify-center">
              <span className="text-foreground font-medium text-base sm:text-lg capitalize">
                {isLoadingCurrentUser ? "Loading..." : formatProfileName(profile)}
              </span>
              <span className="text-muted-foreground text-sm sm:text-base capitalize">
                {formatProfileDetails(profile)}
              </span>
            </div>

            <div className="flex items-center justify-center shrink-0">
              <ChevronsUpDown className="text-muted-foreground w-5 h-5" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="start" className="rounded-xl">
            <DropdownMenuItem
              onClick={() => {
                router.push("/dashboard/account-settings")
                onClose()
              }}
            >
              <Settings />
              Account settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={logout.isPending} onClick={() => logout.mutate()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>
    </>
  )
}
