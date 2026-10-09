import type { Metadata } from "next"
import ForecastView from "./_components/ForecastView"

export const metadata: Metadata = { title: "Demand Forecast" }

export default function ForecastPage() {
  return <ForecastView />
}
