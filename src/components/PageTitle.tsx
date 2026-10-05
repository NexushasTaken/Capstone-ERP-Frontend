import type { ReactNode } from 'react'

interface PageTitleProps {
  title: string
  count?: ReactNode
}

// Page heading with an optional row-count badge next to it.
export default function PageTitle({ title, count }: PageTitleProps) {
  return (
    <div className="flex items-center gap-3">
      <h1 className="text-2xl font-medium tracking-tight text-[#121514]">{title}</h1>
      {count !== undefined && (
        <span className="rounded-md border border-[#DFE2E0] px-3 py-1 text-sm text-[#121514]">
          {count}
        </span>
      )}
    </div>
  )
}
