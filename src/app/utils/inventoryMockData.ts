import type { InventoryDashboardData, RawMaterialInventoryItem, RawMaterialMovement, RawMaterialSortOption } from '@/app/types/inventory'

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
  { id: 'RM-1001', material: 'Wood screws', category: 'Fasteners', quantity: 1280, unit: 'pcs', reorderPoint: 500, warehouse: 'Manila Hardware Co.', unitCost: 1.8, status: 'In stock' },
  { id: 'RM-1002', material: 'Oak boards', category: 'Lumber', quantity: 86, unit: 'boards', reorderPoint: 40, warehouse: 'Luzon Timber Supply', unitCost: 740, status: 'In stock' },
  { id: 'RM-1003', material: 'Steel brackets', category: 'Hardware', quantity: 224, unit: 'pcs', reorderPoint: 180, warehouse: 'Metro Metalworks', unitCost: 38, status: 'Low stock' },
  { id: 'RM-1004', material: 'Wood glue', category: 'Adhesives', quantity: 32, unit: 'bottles', reorderPoint: 24, warehouse: 'BuildPro Supplies', unitCost: 185, status: 'Low stock' },
  { id: 'RM-1005', material: 'Clear varnish', category: 'Finishing', quantity: 18, unit: 'cans', reorderPoint: 20, warehouse: 'ColorCraft Depot', unitCost: 420, status: 'Critical' },
  { id: 'RM-1006', material: 'Plywood sheets', category: 'Panels', quantity: 64, unit: 'sheets', reorderPoint: 30, warehouse: 'Quezon Panel Mart', unitCost: 1180, status: 'In stock' },
  { id: 'RM-1007', material: 'Drawer slides', category: 'Hardware', quantity: 140, unit: 'pairs', reorderPoint: 70, warehouse: 'Metro Metalworks', unitCost: 260, status: 'In stock' },
  { id: 'RM-1008', material: 'Table legs', category: 'Components', quantity: 48, unit: 'pcs', reorderPoint: 24, warehouse: 'Cavite Woodcraft', unitCost: 390, status: 'In stock' },
  { id: 'RM-1009', material: 'Sanding discs', category: 'Consumables', quantity: 520, unit: 'pcs', reorderPoint: 180, warehouse: 'BuildPro Supplies', unitCost: 12, status: 'In stock' },
  { id: 'RM-1010', material: 'Hex bolts', category: 'Fasteners', quantity: 760, unit: 'pcs', reorderPoint: 300, warehouse: 'Manila Hardware Co.', unitCost: 4.5, status: 'In stock' },
]

export const mockRawMaterialMovements: RawMaterialMovement[] = [
  { id: 'MOV-1001-01', materialId: 'RM-1001', type: 'Stock in', quantity: 280, unit: 'pcs', date: '12 Aug, 2026', reference: 'PO-8841', handledBy: 'Juan' },
  { id: 'MOV-1001-02', materialId: 'RM-1001', type: 'Stock out', quantity: 120, unit: 'pcs', date: '10 Aug, 2026', reference: 'JOB-2140', handledBy: 'Miguel' },
  { id: 'MOV-1001-03', materialId: 'RM-1001', type: 'Adjustment', quantity: 15, unit: 'pcs', date: '08 Aug, 2026', reference: 'ADJ-018', handledBy: 'Lara' },
  { id: 'MOV-1002-01', materialId: 'RM-1002', type: 'Stock in', quantity: 24, unit: 'boards', date: '11 Aug, 2026', reference: 'PO-8842', handledBy: 'Angela' },
  { id: 'MOV-1002-02', materialId: 'RM-1002', type: 'Stock out', quantity: 12, unit: 'boards', date: '09 Aug, 2026', reference: 'JOB-2144', handledBy: 'Paolo' },
  { id: 'MOV-1003-01', materialId: 'RM-1003', type: 'Stock out', quantity: 48, unit: 'pcs', date: '12 Aug, 2026', reference: 'JOB-2151', handledBy: 'Rina' },
  { id: 'MOV-1003-02', materialId: 'RM-1003', type: 'Stock in', quantity: 96, unit: 'pcs', date: '07 Aug, 2026', reference: 'PO-8837', handledBy: 'Juan' },
  { id: 'MOV-1004-01', materialId: 'RM-1004', type: 'Stock out', quantity: 8, unit: 'bottles', date: '12 Aug, 2026', reference: 'JOB-2154', handledBy: 'Miguel' },
  { id: 'MOV-1004-02', materialId: 'RM-1004', type: 'Adjustment', quantity: 2, unit: 'bottles', date: '06 Aug, 2026', reference: 'ADJ-021', handledBy: 'Lara' },
  { id: 'MOV-1005-01', materialId: 'RM-1005', type: 'Stock out', quantity: 6, unit: 'cans', date: '11 Aug, 2026', reference: 'JOB-2148', handledBy: 'Angela' },
  { id: 'MOV-1005-02', materialId: 'RM-1005', type: 'Stock out', quantity: 4, unit: 'cans', date: '08 Aug, 2026', reference: 'JOB-2135', handledBy: 'Paolo' },
  { id: 'MOV-1006-01', materialId: 'RM-1006', type: 'Stock in', quantity: 18, unit: 'sheets', date: '10 Aug, 2026', reference: 'PO-8839', handledBy: 'Rina' },
  { id: 'MOV-1007-01', materialId: 'RM-1007', type: 'Stock out', quantity: 20, unit: 'pairs', date: '12 Aug, 2026', reference: 'JOB-2153', handledBy: 'Juan' },
  { id: 'MOV-1008-01', materialId: 'RM-1008', type: 'Stock in', quantity: 16, unit: 'pcs', date: '09 Aug, 2026', reference: 'PO-8838', handledBy: 'Miguel' },
  { id: 'MOV-1009-01', materialId: 'RM-1009', type: 'Stock out', quantity: 80, unit: 'pcs', date: '11 Aug, 2026', reference: 'JOB-2149', handledBy: 'Lara' },
  { id: 'MOV-1010-01', materialId: 'RM-1010', type: 'Stock in', quantity: 240, unit: 'pcs', date: '07 Aug, 2026', reference: 'PO-8836', handledBy: 'Angela' },
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
    label: 'warehouse',
    value: 'warehouse',
    order: 'asc',
  },
]
