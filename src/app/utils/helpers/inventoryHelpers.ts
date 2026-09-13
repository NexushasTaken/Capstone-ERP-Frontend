import type {
  Inventory,
  InventoryDashboardData,
  InventoryLabel,
  InventorySortBy,
  InventoryStatus,
  MovementVelocityCategory,
  VelocityStatus,
  Warehouse,
  WarehouseCapacity,
} from '@/app/types/inventory'
import { WarehouseListItem } from '@/app/types/warehouseCapacity'

export function formatInventoryId(inventoryId: string) {
  return `INV-${inventoryId}`
}

export function getCapacityPercentage({ used, total }: WarehouseCapacity) {
  if (!Number.isFinite(used) || !Number.isFinite(total) || total <= 0) return 0
  return Math.round((used / total) * 100)
}

export function formatNumber(value: number) {
  if (!Number.isFinite(value)) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatPeso(value: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}

export function formatDate(dateString: string | null) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function capitalize(value: string) {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const velocityColors: Record<MovementVelocityCategory, string> = {
  fast: 'bg-[#187B49]',
  stable: 'bg-[#1769C2]',
  slow: 'bg-[#D92D20]',
}

export function getVelocityColor(category: MovementVelocityCategory) {
  return velocityColors[category]
}

export function getWarehouseName(warehouses: Warehouse[], warehouseId: string): string {
  return warehouses.find((w) => w.id === warehouseId)?.name ?? 'Unknown'
}

export function getInventoryStatusLabel(statuses: InventoryStatus[], statusId: string): string {
  return statuses.find((s) => s.id === statusId)?.status ?? 'Unknown'
}

export function getVelocityStatusLabel(velocityStatuses: VelocityStatus[], velocityStatusId: string): string {
  return velocityStatuses.find((v) => v.id === velocityStatusId)?.status ?? 'Unknown'
}

export function getInventoryLabelType(labels: InventoryLabel[], inventoryLabelId: string): string {
  return labels.find((l) => l.id === inventoryLabelId)?.type ?? 'Unknown'
}

export const statusDotColors: Record<string, string> = {
  critical: 'bg-[#D92D20]',
  available: 'bg-[#31723B]',
  'low stock': 'bg-[#D98C00]',
  pending: 'bg-[#9CA3AF]',
}
export const statusTextColors: Record<string, string> = {
  critical: 'text-[#B42318]',
  available: 'text-[#31723B]',
  'low stock': 'text-[#9A6700]',
  pending: 'text-[#6B7280]',
}

export function getInventoryStatusStyleFromLabel(status: string) {
  return {
    dotClassName: statusDotColors[status] ?? 'bg-[#737A76]',
    labelClassName: statusTextColors[status] ?? 'text-[#737A76]',
  }
}

export function buildInventoryDashboardData(
  inventories: Inventory[],
  statuses: InventoryStatus[],
  warehouses: Warehouse[],
  velocityStatuses: VelocityStatus[]
): InventoryDashboardData {
  const criticalStatusId = statuses.find((s) => s.status === 'critical')?.id
  const criticalInventories = criticalStatusId
    ? inventories.filter((item) => item.statusId === criticalStatusId)
    : []

  return {
    forecastWarningCount: criticalInventories.length,
    warehouseCapacity: {
      warehouse: 'All warehouses',
      used: inventories.reduce((sum, item) => sum + item.quantity, 0),
      total: 1000,
    },
    movementVelocity: velocityStatuses.map((velocity) => {
      const count = inventories.filter((item) => item.velocityStatusId === velocity.id).length
      return {
        category: velocity.status as MovementVelocityCategory,
        label: capitalize(velocity.status),
        percentage: inventories.length > 0 ? Math.round((count / inventories.length) * 100) : 0,
      }
    }),
    predictedStockouts: criticalInventories.map((item) => {
      const warehouse = warehouses.find((w) => w.id === item.warehouseId)
      return {
        inventoryId: item.id,
        product: item.name,
        warehouse: warehouse?.name ?? 'Unknown',
        availableUnits: item.quantity,
        reorderPoint: item.reorderPoint,
        estimatedStockoutDate: 'Within 7 days',
        risk: 'critical',
      }
    }),
  }
}

export function formatDateForApi(isoDateString: string): string {
  const date = new Date(isoDateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export const inventoryColumns = ['Inventory ID', 'Name', 'Quantity', 'Reorder point', 'Warehouse', 'Status']

export const inventorySortOptions = [
  { label: 'Name (A to Z)', value: 'name' as InventorySortBy, order: 'asc' as const },
  { label: 'Name (Z to A)', value: 'name' as InventorySortBy, order: 'desc' as const },
  { label: 'Quantity (High to Low)', value: 'quantity' as InventorySortBy, order: 'desc' as const },
  { label: 'Quantity (Low to High)', value: 'quantity' as InventorySortBy, order: 'asc' as const },
  { label: 'Reorder point (Ascending)', value: 'reorderPoint' as InventorySortBy, order: 'asc' as const },
  { label: 'Warehouse ID (Ascending)', value: 'warehouseId' as InventorySortBy, order: 'asc' as const },
]

export function getInventoryFilter(value: { value: InventorySortBy; order: 'asc' | 'desc' }) {
  if (value.value === 'name') return value.order === 'asc' ? 1 : 2
  if (value.value === 'quantity') return value.order === 'desc' ? 3 : 4
  if (value.value === 'reorderPoint') return 5
  if (value.value === 'warehouseId') return 6

  return 0
}

export function isSelectableWarehouse(warehouse: WarehouseListItem) {
  return warehouse.name.toLowerCase() !== 'all warehouse record'
}
