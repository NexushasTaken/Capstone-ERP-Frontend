'use client'

import type { SidebarFormProps } from '@/app/types/sidebar'
import ProfileModal from '@/app/components/modals/ProfileModal'
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
    <aside className={`h-screen shrink-0 flex-col gap-4 bg-white p-4 select-none ${
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

        <div className="flex w-full h-full bg-[#EBF3ED] rounded-lg"/>

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
