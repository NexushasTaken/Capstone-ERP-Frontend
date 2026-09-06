export interface WarehouseCapacity {
  warehouse: string
  used: number
  total: number
}

export interface PredictedStockout {
  inventoryId: string
  product: string
  warehouse: string
  availableUnits: number
  reorderPoint: number
  estimatedStockoutDate: string
}

export type MovementVelocityCategory = 'fast' | 'stable' | 'slow'

export interface MovementVelocityItem {
  category: MovementVelocityCategory
  label: string
  percentage: number
}

export interface InventoryDashboardData {
  forecastWarningCount: number
  warehouseCapacity: WarehouseCapacity
  movementVelocity: MovementVelocityItem[]
  predictedStockouts: PredictedStockout[]
}

export interface Warehouse {
  id: string
  name: string
  address: string
  createdAt: string
  updatedBy: string | null
  updatedAt: string | null
  deletedBy: string | null
  deletedAt: string | null
  isActive: boolean
}

export const INVENTORY_STATUSES = ['critical', 'available', 'low stock'] as const
export type InventoryStatusLabel = (typeof INVENTORY_STATUSES)[number]

export interface InventoryStatus {
  id: string
  status: InventoryStatusLabel
  createdBy: string | null
  createdAt: string
  updatedBy: string | null
  updatedAt: string | null
  deletedBy: string | null
  deletedAt: string | null
  isActive: boolean
}

export const VELOCITY_STATUSES = ['slow', 'fast', 'stable'] as const
export type VelocityStatusLabel = (typeof VELOCITY_STATUSES)[number]

export interface VelocityStatus {
  id: string
  status: VelocityStatusLabel
  createdBy: string | null
  createdAt: string
  updatedBy: string | null
  updatedAt: string | null
  deletedBy: string | null
  deletedAt: string | null
  isActive: boolean
}

export const INVENTORY_LABEL_TYPES = ['purchase', 'damage', 'restock', 'return'] as const
export type InventoryLabelType = (typeof INVENTORY_LABEL_TYPES)[number]

export interface InventoryLabel {
  id: string
  type: InventoryLabelType
  createdBy: string | null
  createdAt: string
  updatedBy: string | null
  updatedAt: string | null
  deletedBy: string | null
  deletedAt: string | null
  isActive: boolean
}

export interface Inventory {
  id: string
  name: string
  quantity: number
  statusId: string
  velocityStatusId: string
  warehouseId: string
  dateArrived: string
  reorderPoint: number
  productId: string
  createdBy: string | null
  createdAt: string
  updatedBy: string | null
  updatedAt: string | null
  deletedBy: string | null
  deletedAt: string | null
  isActive: boolean
}

export interface InventoryTransaction {
  id: string
  inventoryId: string
  quantityChanged: number
  inventoryLabelId: string
  createdBy: string | null
  createdAt: string
  updatedBy: string | null
  updatedAt: string | null
  deletedBy: string | null
  deletedAt: string | null
  isActive: boolean
}

export interface DamagedInventory {
  id: string
  inventoryId: string
  reason: string
  quantity: number
  createdBy: string | null
  createdAt: string
  updatedBy: string | null
  updatedAt: string | null
  deletedBy: string | null
  deletedAt: string | null
  isActive: boolean
}

export interface InventoryListItem {
  id: number
  productId: number
  name: string
  quantity: number
  reorderPoint: number
  warehouseId: number
  warehouseName: string
  status: string
  dateArrived: string
}

export type InventoryFilter = 'All' | string

export interface InventoryStatusFilter {
  label: InventoryFilter
  count: number
}

export type InventorySortBy = 'latest' | 'name' | 'quantity' | 'reorderPoint' | 'warehouse'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export interface InventoryMovementItem {
  quantity: number
  label: string
  created_At: string
}

export interface InventoryDamageItem {
  quantity: number
  reason: string
  created_At: string
}
export interface InventoryVelocityItem {
  inventoryId: number
  name: string
  warehouse: string
  classification: string
  velocityMetric: number
}
