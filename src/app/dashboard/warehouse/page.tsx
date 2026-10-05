import type { Metadata } from "next"
import WarehousesView from "./_components/WarehousesView"

export const metadata: Metadata = { title: "Warehouses" }

export default function WarehousesPage() {
  return <WarehousesView />
}
