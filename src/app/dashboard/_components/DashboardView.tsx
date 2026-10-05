import InventoryOverview from "./InventoryOverview"
import PredictedStockouts from "./PredictedStockouts"
import SalesOverviewCard from "./SalesOverviewCard"

export default function DashboardView() {
  return (
    <div className="flex h-dvh scrollbar-none w-full flex-col gap-4 overflow-auto p-3 bg-background">
      <SalesOverviewCard />

      <div className="flex flex-col xl:flex-row gap-4 w-full">
        <div className="flex flex-col w-full h-full gap-4">
          <PredictedStockouts />
        </div>
        <InventoryOverview />
      </div>
    </div>
  )
}
