import { Suspense } from "react"
import type { Metadata } from "next"
import WarehousesView from "./_components/WarehousesView"

export const metadata: Metadata = { title: "Warehouses" }

export default function WarehousesPage() {
  // The view reads its list state from the URL (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense>
      <WarehousesView />
    </Suspense>
  )
}
