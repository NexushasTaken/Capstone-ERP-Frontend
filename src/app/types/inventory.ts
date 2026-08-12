export type InventoryHealthStatus = 'healthy' | 'attention' | 'critical'

export interface InventoryHealth {
  status: InventoryHealthStatus
  score: number
  summary: string
}

export interface WarehouseCapacity {
  warehouse: string
  used: number
  total: number
}

export interface PredictedStockout {
  sku: string
  product: string
  warehouse: string
  availableUnits: number
  estimatedStockoutDate: string
  risk: InventoryHealthStatus
}

export type MovementVelocityCategory = 'fast' | 'stable' | 'slow'

export interface MovementVelocityItem {
  category: MovementVelocityCategory
  label: string
  percentage: number
}

export interface InventoryDashboardData {
  health: InventoryHealth
  forecastWarningCount: number
  warehouseCapacity: WarehouseCapacity
  movementVelocity: MovementVelocityItem[]
  predictedStockouts: PredictedStockout[]
}

export const RAW_MATERIAL_STATUSES = [
  'In stock',
  'Low stock',
  'Critical',
] as const

export type RawMaterialStatus =
  (typeof RAW_MATERIAL_STATUSES)[number]

export type RawMaterialFilter =
  | 'All'
  | RawMaterialStatus

export interface RawMaterialInventoryItem {
  id: string
  material: string
  category: string
  quantity: number
  unit: string
  reorderPoint: number
  warehouse: string
  unitCost: number
  status: RawMaterialStatus
}

export type RawMaterialMovementType =
  | 'Stock in'
  | 'Stock out'
  | 'Adjustment'

export interface RawMaterialMovement {
  id: string
  materialId: string
  type: RawMaterialMovementType
  quantity: number
  unit: string
  date: string
  reference: string
  handledBy: string
}

export interface RawMaterialStatusFilter {
  label: RawMaterialFilter
  count: number
}

export type RawMaterialSortBy =
  | 'material'
  | 'quantity'
  | 'reorderPoint'
  | 'unitCost'
  | 'warehouse'

export interface RawMaterialSortOption {
  label: string
  value: RawMaterialSortBy
  order: 'asc' | 'desc'
}

export interface SortPopoverProps {
  value: RawMaterialSortBy
  order: 'asc' | 'desc'
  onChange: (
    value: RawMaterialSortBy,
    order: 'asc' | 'desc'
  ) => void
  trigger?: React.ReactNode
}
