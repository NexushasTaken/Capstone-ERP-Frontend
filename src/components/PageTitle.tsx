import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

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
      <Heading className="text-2xl font-medium tracking-tight text-foreground">{title}</Heading>
      {count !== undefined && (
        <Badge className="h-6 px-2.5 text-sm" variant="outline">
          {count}
        </Badge>
      )}
    </div>
  )
}
