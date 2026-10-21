import { Suspense } from "react"
import type { Metadata } from "next"
import UnitsView from "./_components/UnitsView"

export const metadata: Metadata = { title: "Units" }

export default function UnitsPage() {
  // The view reads its list state from the URL (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense>
      <UnitsView />
    </Suspense>
  )
}
