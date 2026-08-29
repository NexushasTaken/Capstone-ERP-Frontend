'use client'

import SidebarForm from '@/app/components/SidebarForm'
import type { DashboardShellProps } from '@/app/types/sidebar'
import { Menu } from 'lucide-react'
import { useState } from 'react'

export default function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="flex h-screen w-full">
      <button
        aria-label="Open navigation"
        className="absolute top-4 left-1/2 -translate-x-1/2 z-40 cursor-pointer rounded-full border border-[#E1E4E2] bg-[#121514] p-2 text-white xl:hidden"
        onClick={() => setIsSidebarOpen(true)}
        type="button"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isSidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 cursor-pointer bg-black/25 xl:hidden"
          onClick={closeSidebar}
          type="button"
        />
      )}

      <SidebarForm isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="min-w-0 w-0 flex-1 overflow-x-auto">
        {children}
      </div>
    </div>
  )
}
