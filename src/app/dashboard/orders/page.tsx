import { Suspense } from "react"
import type { Metadata } from "next"
import OrdersView from "./_components/OrdersView"

export const metadata: Metadata = { title: "Orders" }

export default function OrdersPage() {
  // The view reads its list state from the URL (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense>
      <OrdersView />
    </Suspense>
  )
}
