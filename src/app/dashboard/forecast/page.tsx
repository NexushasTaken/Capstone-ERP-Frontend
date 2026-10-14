import { Suspense } from "react"
import type { Metadata } from "next"
import ForecastView from "./_components/ForecastView"

export const metadata: Metadata = { title: "Demand Forecast" }

export default function ForecastPage() {
  // The view reads its list state from the URL (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense>
      <ForecastView />
    </Suspense>
  )
}
