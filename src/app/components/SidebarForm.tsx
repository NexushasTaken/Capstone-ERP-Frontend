'use client'

import type { SidebarFormProps } from '@/app/types/sidebar'
import ProfileModal from '@/app/components/modals/ProfileModal'
import { auditLogs } from '@/app/utils/auditLogMockData'
import { buttonNav } from '@/app/utils/buttonNav'
import { formatProfileDetails } from '@/app/utils/profileHelpers'
import { sidebarProfile } from '@/app/utils/profileMockData'
import { Bell, LayoutDashboard, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function SidebarForm({ isOpen, onClose }: SidebarFormProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <>
    <aside className={`flex h-full scrollbar-none shrink-0 flex-col gap-4 bg-white p-4 overflow-y-auto ${
      isOpen
        ? 'fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-2rem))] shadow-xl lg:static lg:w-1/5 lg:shadow-none'
        : 'hidden lg:flex lg:w-1/5'
    }`}>
        <div className="flex items-center justify-between">
          <span className="text-4xl text-[#0c0d0d] font-semibold">CPro Home</span>
          <button aria-label="Close navigation" className="cursor-pointer p-2 text-[#0c0d0d] lg:hidden" onClick={onClose} type="button">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-2 w-full">

          <Link href="/dashboard" className="flex items-center justify-center gap-4 bg-[#0c0d0d] text-[#F2F0F0] h-32 py-2 rounded-2xl hover:bg-[#1B1C1C] duration-300 transition-all cursor-pointer group" onClick={onClose}>
            <LayoutDashboard className="w-8 h-8 text-[#F2F0F0] group-hover:rotate-90 transition-all duration-300"/>
            <span className="text-[#F2F0F0] text-lg font-medium group-hover:scale-105 transition-all duration-300">Dashboard</span>
          </Link>

          <div className="grid grid-cols-2 gap-1 w-full">
            {buttonNav.map(({ icon: Icon, name, link }) => (
              <Link key={name} href={link} className="flex flex-col items-center justify-center bg-[#FFFFFF] border-2 border-[#F0F1F1] rounded-2xl text-[#0c0d0d] h-32 cursor-pointer hover:bg-[#F0F1F1] hover:border-none group" onClick={onClose}>
                <Icon className="w-8 h-8 text-[#0c0d0d] group-hover:rotate-12 transition-all duration-300" />
                <span className="text-[#0c0d0d] text-lg font-medium group-hover:scale-105 transition-all duration-300 cursor-pointer">{name}</span>
              </Link>
            ))}
          </div>
        </div>

        <section className="flex w-full h-full max-h-70 lg:max-h-full flex-col overflow-hidden rounded-2xl border border-[#E1E4E2] bg-[#FAFBFA] p-3 shrink-0 lg:shrink">
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
        <button aria-label="Open profile" className="flex gap-2 w-full border-2 h-20 rounded-xl border-gray-200 py-1 pl-1 pr-4 shrink-0 text-left transition hover:border-[#A7AEAA] hover:bg-[#FAFBFA] cursor-pointer" onClick={() => setIsProfileOpen(true)} type="button">
          <span className="relative block h-full w-20 shrink-0 overflow-hidden rounded-xl bg-[#F2F0F0]">
            <Image
              alt="Juan Dela Cruz profile"
              className="object-cover"
              fill
              sizes="80px"
              src={sidebarProfile.avatarSrc}
            />
          </span>

          <div className="flex flex-col w-full h-full justify-center">
            <span className="text-[#0c0d0d] font-medium text-lg">{sidebarProfile.firstName}</span>
            <span className="text-[#ACABAA] text-base">{formatProfileDetails(sidebarProfile)}</span>
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
