import DataTable from "@/components/DataTable"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatAuditDate, getAuditAction, getAuditModuleLabel } from "@/lib/helpers/auditLogHelpers"
import type { AuditLogItem } from "@/types/auditLog"

const columns = ["Date", "User", "Module", "Action", "Message"]

interface AuditLogsTableProps {
  logs: AuditLogItem[]
  isLoading: boolean
  error: unknown
  hasFilters: boolean
}

export default function AuditLogsTable({ logs, isLoading, error, hasFilters }: AuditLogsTableProps) {
  return (
    <DataTable
      className="min-w-200"
      columns={columns}
      emptyMessage={hasFilters ? "No audit logs match these filters." : "No audit logs yet."}
      error={error}
      errorMessage="Failed to load audit logs"
      isEmpty={logs.length === 0}
      isLoading={isLoading}
    >
      {logs.map((log) => {
        const { Icon, className, label } = getAuditAction(log.action)

        return (
          <TableRow key={log.id}>
            <TableCell className="px-3 py-4">{formatAuditDate(log.created_At)}</TableCell>
            <TableCell className="px-3 py-4">
              <div className="flex flex-col">
                <span className="font-medium capitalize">{log.userFullName}</span>
                {log.userRole && <span className="text-xs text-muted-foreground">{log.userRole}</span>}
              </div>
            </TableCell>
            <TableCell className="px-3 py-4">{getAuditModuleLabel(log.module)}</TableCell>
            <TableCell className="px-3 py-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${className}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </span>
            </TableCell>
            <TableCell className="px-3 py-4 whitespace-normal">{log.message}</TableCell>
          </TableRow>
        )
      })}
    </DataTable>
  )
}
