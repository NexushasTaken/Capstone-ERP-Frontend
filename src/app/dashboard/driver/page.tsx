import type { Metadata } from "next"
import DriversView from "./_components/DriversView"

export const metadata: Metadata = { title: "Drivers" }

export default function DriversPage() {
  return <DriversView />
}
