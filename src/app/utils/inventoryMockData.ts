import type { InventoryDashboardData } from '@/app/types/inventory'

export const inventoryDashboardData: InventoryDashboardData = {
  health: {
    status: 'attention',
    score: 82,
    summary: 'Inventory is stable, with a few products needing replenishment soon.',
  },
  forecastWarningCount: 4,
  warehouseCapacity: {
    warehouse: 'Main warehouse',
    used: 6840,
    total: 10000,
  },
  movementVelocity: [
    { category: 'fast', label: 'Fast Movers', percentage: 68 },
    { category: 'stable', label: 'Stable', percentage: 22 },
    { category: 'slow', label: 'Slow / Stagnant', percentage: 10 },
  ],
  predictedStockouts: [
    { sku: 'CPH-1042', product: 'Classic White Tee', warehouse: 'Main', availableUnits: 18, estimatedStockoutDate: 'Aug 09, 2026', risk: 'critical' },
    { sku: 'CPH-2088', product: 'Core Fleece Hoodie', warehouse: 'Main', availableUnits: 31, estimatedStockoutDate: 'Aug 13, 2026', risk: 'critical' },
    { sku: 'CPH-3014', product: 'Canvas Tote Bag', warehouse: 'Main', availableUnits: 42, estimatedStockoutDate: 'Aug 19, 2026', risk: 'attention' },
    { sku: 'CPH-1176', product: 'Logo Cap', warehouse: 'Main', availableUnits: 55, estimatedStockoutDate: 'Aug 27, 2026', risk: 'attention' },
  ],
}
