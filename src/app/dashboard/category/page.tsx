import { Suspense } from "react"
import type { Metadata } from "next"
import CategoriesView from "./_components/CategoriesView"

export const metadata: Metadata = { title: "Categories" }

export default function CategoriesPage() {
  // The view reads its list state from the URL (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense>
      <CategoriesView />
    </Suspense>
  )
}
