import { Suspense } from "react"
import type { Metadata } from "next"
import PurchasesView from "./_components/PurchasesView"

export const metadata: Metadata = { title: "Purchases" }

export default function PurchasesPage() {
  // The view reads its list state from the URL (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense>
      <PurchasesView />
    </Suspense>
  )
}
