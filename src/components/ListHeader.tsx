import type { ReactNode } from "react"
import PageTitle from "@/components/PageTitle"

interface ListHeaderProps {
  title: string
  count?: ReactNode
  /** Use 'h2' when the page already has an h1. */
  as?: "h1" | "h2"
  /** Page-level buttons (export, add), shown top right. */
  actions?: ReactNode
  /** The search box; it takes the free space on the toolbar row. */
  search?: ReactNode
  /** Dropdown filters and sort, shown beside the search and wrapping under it when narrow. */
  filters?: ReactNode
}

// Header shared by every list page: title and actions on the first row, search and filters on the second.
export default function ListHeader({ title, count, as, actions, search, filters }: ListHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title={title} count={count} as={as} />
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      {search || filters ? (
        <div className="flex flex-wrap items-center gap-2">
          {search ? <div className="min-w-64 max-w-xl flex-1">{search}</div> : null}
          {filters}
        </div>
      ) : null}
    </div>
  )
}
