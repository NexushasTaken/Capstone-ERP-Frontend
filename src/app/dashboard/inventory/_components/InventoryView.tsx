import ForecastRiskCard from "./ForecastRiskCard"
import InventoryItemsSection from "./InventoryItemsSection"
import MovementVelocity from "./MovementVelocity"
import WarehouseCapacitySection from "./WarehouseCapacitySection"

export default function InventoryView() {
  return (
    <main className="flex h-dvh w-full p-3 xl:p-6 bg-background">
      <div className="flex w-full flex-col gap-5 flex-1 min-h-0 overflow-y-auto scrollbar-none">
        <header>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Inventory</h1>
          <p className="mt-2 text-sm text-muted-foreground">Forecast inventory health and act on upcoming stockouts.</p>
        </header>

        <section className="grid xl:grid-cols-2 gap-4 min-w-0 columns-1">
          <ForecastRiskCard />
          <MovementVelocity />
        </section>

        <InventoryItemsSection />

        <WarehouseCapacitySection />
      </div>
    </main>
  )
}
