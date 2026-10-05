import type {
  InventorySortBy,
  WarehouseCapacity,
} from '@/types/inventory'
import { WarehouseListItem } from '@/types/warehouseCapacity'

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

export function capitalize(value: string) {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
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

export function formatDateForApi(isoDateString: string): string {
  const date = new Date(isoDateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export const inventorySortOptions = [
  { label: 'Latest added', value: 'latest' as InventorySortBy, order: 'asc' as const },
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
