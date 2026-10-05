import type { Metadata } from "next"
import InventoryView from "./_components/InventoryView"

export const metadata: Metadata = { title: "Inventory" }

export default function InventoryPage() {
  return <InventoryView />
}
