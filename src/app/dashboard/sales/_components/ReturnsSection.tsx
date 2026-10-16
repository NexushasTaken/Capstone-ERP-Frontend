"use client"

import ListSummary from "@/components/ListSummary"
import PageSizeSelect from "@/components/PageSizeSelect"
import { TablePagination } from "@/components/TablePagination"
import { usePageSize } from "@/hooks/usePageSize"
import { formatCount } from "@/lib/format"
import { useSaleReturns } from "../_hooks/useSaleReturns"
import ReturnsTable from "./ReturnsTable"

interface ReturnsSectionProps {
  search: string
  from: string
  to: string
  page: number
  onPageChange: (page: number) => void
}

// The Returns tab: every product customers brought back, newest first.
export default function ReturnsSection({ search, from, to, page, onPageChange }: ReturnsSectionProps) {
  const [pageSize, setPageSize] = usePageSize("returns")
  const { data, isLoading, isPlaceholderData, isFetching, error } = useSaleReturns({
    page,
    pageSize,
    name: search || undefined,
    from: from || undefined,
    to: to || undefined,
  })

  const returns = data?.items ?? []
  const rows = data?.rows ?? 0
  const pageCount = Math.max(1, data?.pageCount ?? 1)

  return (
    <>
      <ListSummary>{formatCount(rows, "return")}</ListSummary>

      <div className="mt-5 min-h-0 flex-1 overflow-auto scrollbar-x-only">
        <ReturnsTable returns={returns} isLoading={isLoading || isPlaceholderData} error={error} />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {returns.length} of {rows} returns
          </span>
          <PageSizeSelect
            value={pageSize}
            onChange={(size) => {
              setPageSize(size)
              onPageChange(1)
            }}
          />
          {isFetching && <span className="text-sm text-muted-foreground">Updating...</span>}
        </div>
        <div className="flex">
          <TablePagination currentPage={page} totalPages={pageCount} onPageChange={onPageChange} />
        </div>
      </div>
    </>
  )
}
