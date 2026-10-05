import type { ReactNode } from 'react'

interface PageTitleProps {
  title: string
  count?: ReactNode
  /** Use 'h2' when the page already has an h1. */
  as?: 'h1' | 'h2'
}

// Page heading with an optional row-count badge next to it.
export default function PageTitle({ title, count, as: Heading = 'h1' }: PageTitleProps) {
  return (
    <div className="flex items-center gap-3">
      <Heading className="text-2xl font-medium tracking-tight text-[#121514]">{title}</Heading>
      {count !== undefined && (
        <span className="rounded-md border border-[#DFE2E0] px-3 py-1 text-sm text-[#121514]">
          {count}
        </span>
      )}
    </div>
  )
}
