import { cn } from "@/lib/utils"
import type { PurchaseStatus } from "@/types/purchase"
import { purchaseStatusStyles } from "../_lib/purchaseHelpers"

export default function PurchaseStatusLabel({ status, className }: { status: PurchaseStatus; className?: string }) {
  const style = purchaseStatusStyles[status]
  return (
    <span className={cn("inline-flex items-center gap-1 font-medium", style.className, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dotClassName)} />
      {style.label}
    </span>
  )
}
