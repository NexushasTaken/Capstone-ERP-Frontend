import { Suspense } from "react"
import type { Metadata } from "next"
import ProductsView from "./_components/ProductsView"

export const metadata: Metadata = { title: "Products" }

export default function ProductsPage() {
  // The view reads its list state from the URL (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense>
      <ProductsView />
    </Suspense>
  )
}
