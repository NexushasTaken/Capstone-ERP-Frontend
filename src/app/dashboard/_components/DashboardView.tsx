import InventoryOverview from "./InventoryOverview"
import RestockSummaryCard from "./RestockSummaryCard"
import SalesOverviewCard from "./SalesOverviewCard"

export default function DashboardView() {
  return (
    <div className="flex h-dvh scrollbar-none w-full flex-col gap-4 overflow-auto p-3 bg-background">
      <SalesOverviewCard />

      <div className="grid w-full gap-4 xl:grid-cols-2">
        <RestockSummaryCard />
        <InventoryOverview />
      </div>
    </div>
  )
}
