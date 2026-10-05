"use client"

import Sidebar from "@/app/dashboard/_components/Sidebar"
import { Menu } from "lucide-react"
import { type ReactNode, useEffect, useRef, useState } from "react"

interface DashboardShellProps {
  children: ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showMenuButton, setShowMenuButton] = useState(true)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const hideAfterDelay = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }

      hideTimerRef.current = setTimeout(() => {
        setShowMenuButton(false)
      }, 2000)
    }

    const showMenuTemporarily = () => {
      setShowMenuButton(true)

      hideAfterDelay()
    }

    hideAfterDelay()

    document.addEventListener("scroll", showMenuTemporarily, {
      capture: true,
      passive: true,
    })
    document.addEventListener("pointerdown", showMenuTemporarily, {
      capture: true,
      passive: true,
    })
    document.addEventListener("touchstart", showMenuTemporarily, {
      capture: true,
      passive: true,
    })

    return () => {
      document.removeEventListener("scroll", showMenuTemporarily, {
        capture: true,
      })
      document.removeEventListener("pointerdown", showMenuTemporarily, {
        capture: true,
      })
      document.removeEventListener("touchstart", showMenuTemporarily, {
        capture: true,
      })

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [])

  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="flex h-dvh w-full">
      <button
        aria-label="Open navigation"
        className={`
          fixed top-4 left-1/2 z-40 -translate-x-1/2
          cursor-pointer rounded-full border border-border
          bg-primary p-2 text-primary-foreground xl:hidden
          transition-all duration-300 ease-out
          ${showMenuButton ? "translate-y-0 opacity-100" : "-translate-y-3 pointer-events-none opacity-0"}
        `}
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

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="min-w-0 w-0 flex-1 overflow-x-auto">{children}</div>
    </div>
  )
}
