"use client"

import { X } from "lucide-react"

import { useAuditLogFilters } from "../_hooks/useAuditLogFilters"
import AuditFilterDropdown from "./AuditFilterDropdown"
import AuditLogsTable from "./AuditLogsTable"
import ListHeader from "@/components/ListHeader"
import PageSizeSelect from "@/components/PageSizeSelect"
import { TablePagination } from "@/components/TablePagination"
import { usePageSize } from "@/hooks/usePageSize"
import { useAuditLogs, useUsers } from "@/hooks/useAuditLogs"
import { Button } from "@/components/ui/button"
import {
  auditActionFilterOptions,
  auditModuleFilterOptions,
  auditRoleFilterOptions,
  toUserFilterOptions,
} from "@/lib/helpers/auditLogHelpers"

export default function AuditLogsView() {
  const { values: filters, update } = useAuditLogFilters()
  const { userId, role, module, action, page: currentPage } = filters
  const { data: users = [] } = useUsers()
  const [pageSize, setPageSize] = usePageSize("audit-logs")
  const queryParams = {
    page: currentPage,
    pageSize,
    userId: userId ?? undefined,
    role: role ?? undefined,
    module: module ?? undefined,
    action: action ?? undefined,
  }
  const { data, isLoading, isPlaceholderData, isFetching, error } = useAuditLogs(queryParams)

  const logs = data?.items ?? []
  const rows = data?.rows ?? 0
  const pageCount = Math.max(1, data?.pageCount ?? 1)
  const hasFilters = userId !== null || role !== null || module !== null || action !== null

  function clearFilters() {
    update({ userId: null, role: null, module: null, action: null })
  }

  return (
    <section className="flex h-dvh w-full flex-col overflow-hidden rounded-2xl bg-background p-4 lg:p-5">
      <ListHeader
        title="Audit logs"
        filters={
          <>
            <AuditFilterDropdown
              label="User"
              allLabel="All users"
              options={toUserFilterOptions(users)}
              value={userId}
              onChange={(userId) => update({ userId })}
              searchPlaceholder="Search users"
            />
            <AuditFilterDropdown
              label="Role"
              allLabel="All roles"
              options={auditRoleFilterOptions}
              value={role}
              onChange={(role) => update({ role })}
            />
            <AuditFilterDropdown
              label="Module"
              allLabel="All modules"
              options={auditModuleFilterOptions}
              value={module}
              onChange={(module) => update({ module })}
            />
            <AuditFilterDropdown
              label="Action"
              allLabel="All actions"
              options={auditActionFilterOptions}
              value={action}
              onChange={(action) => update({ action })}
            />
            {hasFilters && (
              <Button className="text-muted-foreground" onClick={clearFilters} type="button" variant="ghost">
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </>
        }
      />

      <div className="mt-5 min-h-0 flex-1 overflow-auto scrollbar-x-only">
        <AuditLogsTable logs={logs} isLoading={isLoading || isPlaceholderData} error={error} hasFilters={hasFilters} />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {logs.length} of {rows} audit logs
            {isFetching ? " - Updating..." : ""}
          </span>
          <PageSizeSelect
            value={pageSize}
            onChange={(size) => {
              setPageSize(size)
              update({ page: 1 })
            }}
          />
        </div>
        <div className="flex">
          <TablePagination currentPage={currentPage} totalPages={pageCount} onPageChange={(page) => update({ page })} />
        </div>
      </div>
    </section>
  )
}
