'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

import AuditFilterDropdown from './AuditFilterDropdown'
import AuditLogsTable from './AuditLogsTable'
import PageTitle from '@/components/PageTitle'
import { TablePagination } from '@/components/TablePagination'
import { useAuditLogs, useUsers } from '@/hooks/useAuditLogs'
import { Button } from '@/components/ui/button'
import {
  AUDIT_LOG_ITEMS_PER_PAGE,
  auditActionFilterOptions,
  auditModuleFilterOptions,
  auditRoleFilterOptions,
  toUserFilterOptions,
} from '@/lib/helpers/auditLogHelpers'

export default function AuditLogsView() {
  const [currentPage, setCurrentPage] = useState(1)
  const [userId, setUserId] = useState<number | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [module, setModule] = useState<number | null>(null)
  const [action, setAction] = useState<number | null>(null)
  const { data: users = [] } = useUsers()
  const queryParams = {
    page: currentPage,
    pageSize: AUDIT_LOG_ITEMS_PER_PAGE,
    userId: userId ?? undefined,
    role: role ?? undefined,
    module: module ?? undefined,
    action: action ?? undefined,
  }
  const { data, isLoading, isFetching, error } = useAuditLogs(queryParams)

  const logs = data?.items ?? []
  const rows = data?.rows ?? 0
  const pageCount = Math.max(1, data?.pageCount ?? 1)
  const hasFilters = userId !== null || role !== null || module !== null || action !== null

  // Every filter change starts again from the first page.
  function withPageReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value)
      setCurrentPage(1)
    }
  }

  function clearFilters() {
    setUserId(null)
    setRole(null)
    setModule(null)
    setAction(null)
    setCurrentPage(1)
  }

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-2xl bg-background p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <PageTitle title="Audit logs" count={rows} />

        <div className="flex flex-wrap items-center gap-2">
          <AuditFilterDropdown
            label="User"
            allLabel="All users"
            options={toUserFilterOptions(users)}
            value={userId}
            onChange={withPageReset(setUserId)}
            searchPlaceholder="Search users"
          />
          <AuditFilterDropdown
            label="Role"
            allLabel="All roles"
            options={auditRoleFilterOptions}
            value={role}
            onChange={withPageReset(setRole)}
          />
          <AuditFilterDropdown
            label="Module"
            allLabel="All modules"
            options={auditModuleFilterOptions}
            value={module}
            onChange={withPageReset(setModule)}
          />
          <AuditFilterDropdown
            label="Action"
            allLabel="All actions"
            options={auditActionFilterOptions}
            value={action}
            onChange={withPageReset(setAction)}
          />
          {hasFilters && (
            <Button
              className="rounded-xl cursor-pointer px-3 py-2 text-sm text-muted-foreground"
              onClick={clearFilters}
              type="button"
              variant="ghost"
            >
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className="mt-5 min-h-0 overflow-auto scrollbar-none">
        <AuditLogsTable logs={logs} isLoading={isLoading} error={error} hasFilters={hasFilters} />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-muted-foreground">
          Showing {logs.length} of {rows} audit logs
          {isFetching ? ' - Updating...' : ''}
        </span>
        <div className="flex">
          <TablePagination currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />
        </div>
      </div>
    </section>
  )
}
