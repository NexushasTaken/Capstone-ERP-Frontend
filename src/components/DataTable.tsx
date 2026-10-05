import type { ReactNode } from 'react'
import Loading from '@/components/Loading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type DataTableColumn = string | { label: string; className?: string; srOnly?: boolean }

interface DataTableProps {
  columns: DataTableColumn[]
  isLoading: boolean
  error: unknown
  isEmpty: boolean
  /** Shown when `error` isn't an Error with its own message. */
  errorMessage: string
  emptyMessage: ReactNode
  /** Classes for the <table>, usually a min width such as `min-w-150`. */
  className?: string
  /**
   * The rows. Normally <TableRow>s, wrapped in one <tbody> for you.
   * With `rowGroups`, each child is its own <tbody> (used by rows that expand).
   */
  children: ReactNode
  rowGroups?: boolean
}

// shadcn Table with the header, and the loading / error / empty row every list page needs.
export default function DataTable({
  columns,
  isLoading,
  error,
  isEmpty,
  errorMessage,
  emptyMessage,
  className,
  children,
  rowGroups = false,
}: DataTableProps) {
  const status = isLoading ? (
    <Loading />
  ) : error ? (
    <span className="text-destructive">{error instanceof Error ? error.message : errorMessage}</span>
  ) : isEmpty ? (
    emptyMessage
  ) : null

  return (
    <Table className={cn('text-left', className)}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((column) => {
            const {
              label,
              className: columnClassName,
              srOnly,
            } = typeof column === 'string' ? { label: column, className: undefined, srOnly: false } : column
            return (
              <TableHead
                className={cn('px-3 font-normal text-muted-foreground', columnClassName)}
                key={label}
                scope="col"
              >
                {srOnly ? <span className="sr-only">{label}</span> : label}
              </TableHead>
            )
          })}
        </TableRow>
      </TableHeader>
      {status !== null ? (
        <TableBody>
          <TableRow className="hover:bg-transparent">
            <TableCell className="px-3 py-6 text-center text-muted-foreground" colSpan={columns.length}>
              {status}
            </TableCell>
          </TableRow>
        </TableBody>
      ) : rowGroups ? (
        children
      ) : (
        <TableBody>{children}</TableBody>
      )}
    </Table>
  )
}
