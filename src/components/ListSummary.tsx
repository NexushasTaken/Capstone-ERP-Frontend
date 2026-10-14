import type { ReactNode } from "react"

// One line under a list header: how many rows match, plus any totals worth knowing.
export default function ListSummary({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-sm text-muted-foreground">{children}</p>
}
