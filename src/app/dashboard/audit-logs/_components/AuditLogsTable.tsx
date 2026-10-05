import Loading from '@/components/Loading'
import {
  auditLogTableColumns,
  formatAuditDate,
  getAuditAction,
  getAuditModuleLabel,
} from '@/lib/helpers/auditLogHelpers'
import type { AuditLogItem } from '@/types/auditLog'

interface AuditLogsTableProps {
  logs: AuditLogItem[]
  isLoading: boolean
  error: unknown
  hasFilters: boolean
}

export default function AuditLogsTable({ logs, isLoading, error, hasFilters }: AuditLogsTableProps) {
  return (
    <table className="w-full min-w-200 border-separate border-spacing-y-2 text-left">
      <thead className="text-sm font-normal text-[#737A76]">
        <tr>
          {auditLogTableColumns.map((column) => (
            <th className="px-3 pb-1 font-normal" key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={auditLogTableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
              <Loading />
            </td>
          </tr>
        ) : error ? (
          <tr>
            <td colSpan={auditLogTableColumns.length} className="px-3 py-4 text-center text-sm text-red-500">
              {error instanceof Error ? error.message : 'Failed to load audit logs'}
            </td>
          </tr>
        ) : logs.length === 0 ? (
          <tr>
            <td colSpan={auditLogTableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
              {hasFilters ? 'No audit logs match these filters.' : 'No audit logs yet.'}
            </td>
          </tr>
        ) : (
          logs.map((log) => {
            const { Icon, className, label } = getAuditAction(log.action)

            return (
              <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={log.id}>
                <td className="rounded-l-xl px-3 py-4 whitespace-nowrap">{formatAuditDate(log.created_At)}</td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-medium capitalize">{log.userFullName}</span>
                    {log.userRole && <span className="text-xs text-[#737A76]">{log.userRole}</span>}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">{getAuditModuleLabel(log.module)}</td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${className}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                </td>
                <td className="rounded-r-xl px-3 py-4">{log.message}</td>
              </tr>
            )
          })
        )}
      </tbody>
    </table>
  )
}
