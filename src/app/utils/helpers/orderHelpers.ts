import type { Order, OrderGroup, OrderSortOption } from '@/app/types/order'

export function formatOrderId(orderId: string) {
  return `#${orderId}`
}

export function formatOrderNumber(orderId: number) {
  return `#${orderId}`
}

export const tableColumns = [
  'Order ID',
  'Product',
  'Order Type',
  'Order Status',
  'Customer',
  'Order Date',
  'Amount',
]

export const itemsPerPage = 10

export const productSelectPageSize = 100

export const orderSortOptions: OrderSortOption[] = [
  { label: 'Order Date (Newest first)', value: 'createdAt', order: 'desc' },
  { label: 'Order Date (Oldest first)', value: 'createdAt', order: 'asc' },
  { label: 'Customer (A to Z)', value: 'customerName', order: 'asc' },
  { label: 'Customer (Z to A)', value: 'customerName', order: 'desc' },
  { label: 'Quantity (High to low)', value: 'quantity', order: 'desc' },
  { label: 'Quantity (Low to high)', value: 'quantity', order: 'asc' },
  { label: 'Amount (High to low)', value: 'amount', order: 'desc' },
  { label: 'Amount (Low to high)', value: 'amount', order: 'asc' },
]

export function formatDate(dateString: string | null) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getOrderGroupPrimaryItem(group: OrderGroup): Order | null {
  return group.orders[0] ?? null
}

export function getOrderGroupKey(group: OrderGroup) {
  const primary = getOrderGroupPrimaryItem(group)
  return primary?.bundleCode ?? String(primary?.id ?? 'empty-order')
}

export function getOrderGroupProductSummary(group: OrderGroup) {
  if (group.orders.length === 0) return 'Unknown'
  if (group.orders.length === 1) return group.orders[0].productName

  return `${group.orders[0].productName} + ${group.orders.length - 1} more`
}

export function normalizeOrderText(value: string | null | undefined) {
  if (!value) return '-'
  return value.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function orderStatusClass(status: string) {
  const normalized = status.toLowerCase()

  if (normalized.includes('ship') || normalized.includes('complete')) return 'text-[#1F7A1F]'
  if (normalized.includes('cancel')) return 'text-[#B42318]'
  if (normalized.includes('pending') || normalized.includes('process')) return 'text-[#9A5B00]'

  return 'text-[#737A76]'
}

export function orderStatusDotClass(status: string) {
  const normalized = status.toLowerCase()

  if (normalized.includes('ship') || normalized.includes('complete')) return 'bg-[#39B82C]'
  if (normalized.includes('cancel')) return 'bg-[#D92D20]'
  if (normalized.includes('pending') || normalized.includes('process')) return 'bg-[#FFB020]'

  return 'bg-[#737A76]'
}
