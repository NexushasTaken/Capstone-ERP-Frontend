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
