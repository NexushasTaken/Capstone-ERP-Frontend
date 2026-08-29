'use client'

import type { SidebarFormProps } from '@/app/types/sidebar'
import ProfileModal from '@/app/components/modals/ProfileModal'
import { auditLogs } from '@/app/utils/mock/auditLogMockData'
import { buttonNav } from '@/app/utils/buttonNav'
import { formatProfileDetails } from '@/app/utils/helpers/profileHelpers'
import { sidebarProfile } from '@/app/utils/mock/profileMockData'
import { Bell, LayoutDashboard, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import cproLogo from "../../../public/cproLogo.png"

export default function SidebarForm({ isOpen, onClose }: SidebarFormProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const pathname = usePathname()

  const getLinkClasses = (isActive: boolean) =>
    isActive
      ? 'bg-[#0c0d0d] text-[#F2F0F0] hover:bg-[#1B1C1C] duration-300 transition-all'
      : 'bg-[#FFFFFF] border-2 border-[#F0F1F1] text-[#0c0d0d] hover:bg-[#F0F1F1] hover:border-none'

  const dashboardActive = pathname === '/dashboard'

  return (
    <>
    <aside className={`flex h-full scrollbar-none shrink-0 flex-col gap-3 bg-white p-3 overflow-y-auto sm:gap-4${
      isOpen
        ? 'fixed inset-y-0 left-0 z-50 flex w-[min(18rem,calc(100vw-1.5rem))] shadow-xl sm:w-[min(20rem,calc(100vw-2rem))] xl:static xl:w-1/5 xl:shadow-none'
        : 'hidden xl:flex xl:w-1/5'
    }`}>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center text-2xl text-[#0c0d0d] font-semibold sm:text-3xl md:text-4xl">
            <div className='relative w-10 h-10 lg:w-20 lg:h-20 rounded-full'>
              <Image src={cproLogo} alt="Cpro Logo" className='object-contain' fill priority/>
            </div>
            CPro Home
          </span>
          <button aria-label="Close navigation" className="cursor-pointer p-2 text-[#0c0d0d] xl:hidden" onClick={onClose} type="button">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-2 w-full">

          <Link href="/dashboard" className={`flex items-center justify-center gap-3 rounded-2xl py-2 cursor-pointer group sm:gap-4 h-32
            ${getLinkClasses(dashboardActive)}
            `} onClick={onClose}>
            <LayoutDashboard className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${dashboardActive ? 'text-[#F2F0F0]' : 'text-[#0c0d0d]'} group-hover:rotate-90 transition-all duration-300`}/>
            <span className={`${dashboardActive ? 'text-[#F2F0F0]' : 'text-[#0c0d0d]'} text-base font-medium group-hover:scale-105 transition-all duration-300 sm:text-lg`}>Dashboard</span>
          </Link>

          <div className="grid w-full grid-cols-2 gap-1">
            {buttonNav.map(({ icon: Icon, name, link }) => {
              const isActive = pathname === link

              return (
                <Link key={name} href={link} className={`flex flex-col items-center justify-center rounded-2xl cursor-pointer group h-32
                ${getLinkClasses(isActive)}
                `} onClick={onClose}>
                  <Icon className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${isActive ? 'text-[#F2F0F0]' : 'text-[#0c0d0d]'} group-hover:rotate-12 transition-all duration-300`} />
                  <span className={`${isActive ? 'text-[#F2F0F0]' : 'text-[#0c0d0d]'} text-sm font-medium group-hover:scale-105 transition-all duration-300 cursor-pointer sm:text-base md:text-lg`}>{name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <section className="flex w-full h-full max-h-56 flex-col overflow-hidden rounded-2xl border border-[#E1E4E2] bg-[#FAFBFA] p-3 shrink-0 sm:max-h-64 md:max-h-full md:shrink">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#0c0d0d]">Audit logs</span>
              <span className="text-xs text-[#737A76]">Inventory, sales, orders</span>
            </div>
            <span className="text-xs text-[#737A76]">{auditLogs.length}</span>
          </div>

          <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto scrollbar-none">
            {auditLogs.map(({ id, label, detail, firstName, time, Icon, className }) => (
              <div key={id} className="flex items-center gap-2 rounded-xl bg-white p-2">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${className}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-[#0c0d0d]">{label}</span>
                    <span className="shrink-0 text-[11px] text-[#A2A7A4]">{time}</span>
                  </div>
                  <div className="relative flex min-w-0 items-center">
                    <span className="min-w-0 flex-1 truncate pr-2 text-xs text-[#737A76]">{detail}</span>
                    <span className="relative z-10 shrink-0 bg-white pl-1 text-xs font-medium text-[#0c0d0d]">{firstName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROFILE */}
        <button aria-label="Open profile" className="flex h-16 w-full gap-2 rounded-xl border-2 border-gray-200 py-1 pl-1 pr-3 shrink-0 text-left transition hover:border-[#A7AEAA] hover:bg-[#FAFBFA] cursor-pointer sm:h-20 sm:pr-4" onClick={() => setIsProfileOpen(true)} type="button">
          <span className="relative block h-full w-16 shrink-0 overflow-hidden rounded-xl bg-[#F2F0F0] sm:w-20">
            <Image
              alt="Juan Dela Cruz profile"
              className="object-cover"
              fill
              sizes="(min-width: 640px) 80px, 64px"
              src={sidebarProfile.avatarSrc}
            />
          </span>

          <div className="flex flex-col w-full h-full justify-center">
            <span className="text-[#0c0d0d] font-medium text-base sm:text-lg">{sidebarProfile.firstName}</span>
            <span className="text-[#ACABAA] text-sm sm:text-base">{formatProfileDetails(sidebarProfile)}</span>
          </div>

          <div className="flex items-center justify-center shrink-0">
            <Bell className="text-[#0c0d0d] w-6 h-6"/>
          </div>
        </button>
    </aside>
    <ProfileModal
      isOpen={isProfileOpen}
      onClose={() => setIsProfileOpen(false)}
      profile={sidebarProfile}
    />
    </>
  )
}
