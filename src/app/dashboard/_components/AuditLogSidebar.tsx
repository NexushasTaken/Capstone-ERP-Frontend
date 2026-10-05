"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { useAuditLogs } from "@/hooks/useAuditLogs"
import {
  AUDIT_LOG_SIDEBAR_LIMIT,
  formatAuditDate,
  formatAuditRelativeTime,
  getAuditAction,
  getAuditModuleLabel,
} from "@/lib/helpers/auditLogHelpers"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

const sidebarParams = { page: 1, pageSize: AUDIT_LOG_SIDEBAR_LIMIT }

export default function AuditLogSidebar({ onNavigate }: { onNavigate: () => void }) {
  // Polling picks up logs created by other users; our own changes refresh via the MutationCache.
  const { data, isLoading, error } = useAuditLogs(sidebarParams, {
    refetchInterval: 30_000,
  })
  const [now, setNow] = useState(() => Date.now())
  const pathname = usePathname()

  // Keeps "5m"-style times current even when the data itself hasn't changed.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const logs = data?.items ?? []

  return (
    <section
      className={cn(
        "flex w-full min-h-96 flex-col overflow-hidden rounded-2xl border border-border bg-muted/50 p-3",
        pathname === "/dashboard/audit-logs" && "hidden",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">Audit logs</span>
          <span className="text-xs text-muted-foreground">Recent activity</span>
        </div>
        <span className="text-xs text-muted-foreground">{data?.rows ?? 0}</span>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto scrollbar-none">
        {isLoading ? (
          <span className="py-4 text-center text-xs text-muted-foreground">Loading...</span>
        ) : error ? (
          <span className="py-4 text-center text-xs text-destructive">Failed to load audit logs</span>
        ) : logs.length === 0 ? (
          <span className="py-4 text-center text-xs text-muted-foreground">No activity yet.</span>
        ) : (
          logs.map((log) => {
            const { Icon, className, label } = getAuditAction(log.action)

            return (
              <div key={log.id} className="flex items-start gap-2 rounded-xl bg-background p-2" title={log.message}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${className}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {label} · {getAuditModuleLabel(log.module)}
                    </span>
                    <time
                      className="shrink-0 text-[11px] text-muted-foreground"
                      dateTime={log.created_At}
                      title={formatAuditDate(log.created_At)}
                    >
                      {formatAuditRelativeTime(log.created_At, now)}
                    </time>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{log.message}</p>
                  <div className="mt-0.5 flex min-w-0 items-center gap-1 text-xs">
                    <span className="truncate font-medium text-foreground capitalize">{log.userFullName}</span>
                    {log.userRole && <span className="shrink-0 text-muted-foreground">· {log.userRole}</span>}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <Link
        href="/dashboard/audit-logs"
        onClick={onNavigate}
        className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      >
        View all
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}
