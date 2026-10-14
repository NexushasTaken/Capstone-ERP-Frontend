import { Suspense } from "react"
import type { Metadata } from "next"
import DriversView from "./_components/DriversView"

export const metadata: Metadata = { title: "Drivers" }

export default function DriversPage() {
  // The view reads its list state from the URL (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense>
      <DriversView />
    </Suspense>
  )
}
