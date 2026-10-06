import type { ReactNode } from "react"

// A small label/value pair used in the order and sale details and the order review.
export default function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className="block truncate text-sm font-semibold capitalize text-foreground">{value}</span>
    </div>
  )
}
