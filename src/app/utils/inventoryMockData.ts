import type { InventoryDashboardData, RawMaterialInventoryItem, RawMaterialSortOption } from '@/app/types/inventory'

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

export const mockRawMaterials: RawMaterialInventoryItem[] = [
  { id: 'RM-1001', material: 'Wood screws', category: 'Fasteners', usedFor: 'Dining table frames', quantity: 1280, unit: 'pcs', reorderPoint: 500, supplier: 'Manila Hardware Co.', unitCost: 1.8, status: 'In stock' },
  { id: 'RM-1002', material: 'Oak boards', category: 'Lumber', usedFor: 'Table tops', quantity: 86, unit: 'boards', reorderPoint: 40, supplier: 'Luzon Timber Supply', unitCost: 740, status: 'In stock' },
  { id: 'RM-1003', material: 'Steel brackets', category: 'Hardware', usedFor: 'Table leg supports', quantity: 224, unit: 'pcs', reorderPoint: 180, supplier: 'Metro Metalworks', unitCost: 38, status: 'Low stock' },
  { id: 'RM-1004', material: 'Wood glue', category: 'Adhesives', usedFor: 'Chair and table joins', quantity: 32, unit: 'bottles', reorderPoint: 24, supplier: 'BuildPro Supplies', unitCost: 185, status: 'Low stock' },
  { id: 'RM-1005', material: 'Clear varnish', category: 'Finishing', usedFor: 'Table finish coating', quantity: 18, unit: 'cans', reorderPoint: 20, supplier: 'ColorCraft Depot', unitCost: 420, status: 'Reorder' },
  { id: 'RM-1006', material: 'Plywood sheets', category: 'Panels', usedFor: 'Cabinet backing', quantity: 64, unit: 'sheets', reorderPoint: 30, supplier: 'Quezon Panel Mart', unitCost: 1180, status: 'In stock' },
  { id: 'RM-1007', material: 'Drawer slides', category: 'Hardware', usedFor: 'Desk drawers', quantity: 140, unit: 'pairs', reorderPoint: 70, supplier: 'Metro Metalworks', unitCost: 260, status: 'In stock' },
  { id: 'RM-1008', material: 'Table legs', category: 'Components', usedFor: 'Dining tables', quantity: 48, unit: 'pcs', reorderPoint: 24, supplier: 'Cavite Woodcraft', unitCost: 390, status: 'Reserved' },
  { id: 'RM-1009', material: 'Sanding discs', category: 'Consumables', usedFor: 'Surface preparation', quantity: 520, unit: 'pcs', reorderPoint: 180, supplier: 'BuildPro Supplies', unitCost: 12, status: 'In stock' },
  { id: 'RM-1010', material: 'Hex bolts', category: 'Fasteners', usedFor: 'Workbench assembly', quantity: 760, unit: 'pcs', reorderPoint: 300, supplier: 'Manila Hardware Co.', unitCost: 4.5, status: 'In stock' },
]

export const rawMaterialSortOptions: RawMaterialSortOption[] = [
  {
    label: 'Material (A → Z)',
    value: 'material',
    order: 'asc',
  },
  {
    label: 'Material (Z → A)',
    value: 'material',
    order: 'desc',
  },
  {
    label: 'Quantity (High → Low)',
    value: 'quantity',
    order: 'desc',
  },
  {
    label: 'Quantity (Low → High)',
    value: 'quantity',
    order: 'asc',
  },
  {
    label: 'Reorder Point',
    value: 'reorderPoint',
    order: 'desc',
  },
  {
    label: 'Unit Cost',
    value: 'unitCost',
    order: 'desc',
  },
  {
    label: 'Supplier',
    value: 'supplier',
    order: 'asc',
  },
]