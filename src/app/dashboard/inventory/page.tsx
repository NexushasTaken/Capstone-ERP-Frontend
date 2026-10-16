import { Suspense } from "react"
import type { Metadata } from "next"
import InventoryView from "./_components/InventoryView"

export const metadata: Metadata = { title: "Inventory" }

export default function InventoryPage() {
  // The view reads its list state from the URL (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense>
      <InventoryView />
    </Suspense>
  )
}
