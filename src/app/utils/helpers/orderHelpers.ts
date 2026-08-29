import type { Product } from '@/app/types/product'
import type { OrderStatusLabel, OrderTypeLabel } from '@/app/types/order'
import { mockProducts } from '@/app/utils/mock/productMockData'
import { mockOrderTypes } from '@/app/utils/mock/orderTypeMockData'
import { mockOrderStatuses } from '@/app/utils/mock/orderStatusMockData'
import { mockDeliveryDrivers } from '@/app/utils/mock/deliveryDriverMockData'

export function formatOrderId(orderId: string) {
  return `#${orderId}`
}

export function getProductById(productId: string): Product | null {
  return mockProducts.find((product) => product.id === productId) ?? null
}

export function getOrderTypeLabel(orderTypeId: string): OrderTypeLabel | 'Unknown' {
  return mockOrderTypes.find((type) => type.id === orderTypeId)?.type ?? 'Unknown'
}

export function getOrderStatusLabel(orderStatusId: string): OrderStatusLabel | 'Unknown' {
  return mockOrderStatuses.find((status) => status.id === orderStatusId)?.status ?? 'Unknown'
}

export function getDeliveryDriverName(deliveryDriverId: string | null): string {
  if (!deliveryDriverId) return 'Unassigned'
  const driver = mockDeliveryDrivers.find((d) => d.id === deliveryDriverId)
  return driver ? `${driver.firstName} ${driver.lastName}` : 'Unassigned'
}

const statusDotColors: Record<string, string> = {
  'OS-001': 'bg-[#FFB020]',
  'OS-002': 'bg-[#39B82C]',
  'OS-003': 'bg-[#D92D20]',
}

const statusTextColors: Record<string, string> = {
  'OS-001': 'text-[#9A5B00]',
  'OS-002': 'text-[#1F7A1F]',
  'OS-003': 'text-[#B42318]',
}

export function statusDotClass(orderStatusId: string) {
  return statusDotColors[orderStatusId] ?? 'bg-[#737A76]'
}

export function statusTextClass(orderStatusId: string) {
  return statusTextColors[orderStatusId] ?? 'text-[#737A76]'
}

export function formatDate(dateString: string | null) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}