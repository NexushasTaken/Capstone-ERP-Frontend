import type { Sale } from '@/app/types/sale'
import { mockOrders } from '@/app/utils/mock/orderMockData'
import { getProductById, getOrderStatusLabel } from '@/app/utils/helpers/orderHelpers'

export function formatSaleId(saleId: string) {
  return `#${saleId}`
}

export function formatPeso(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string | null) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getOrderForSale(sale: Sale) {
  return mockOrders.find((order) => order.id === sale.orderId) ?? null
}

export function getSaleProductName(sale: Sale): string {
  const order = getOrderForSale(sale)
  if (!order) return 'Unknown'
  return getProductById(order.productId)?.name ?? 'Unknown'
}

export function getSaleCustomerName(sale: Sale): string {
  return getOrderForSale(sale)?.customerName ?? 'Unknown'
}

export function getSaleQuantity(sale: Sale): number {
  return getOrderForSale(sale)?.quantity ?? 0
}

export function getSaleStatusLabel(sale: Sale): string {
  const order = getOrderForSale(sale)
  if (!order) return 'Unknown'
  return getOrderStatusLabel(order.orderStatusId)
}

const statusDotColors: Record<string, string> = {
  Processing: 'bg-[#F7A33C]',
  Completed: 'bg-[#39B82C]',
  Cancelled: 'bg-[#E75959]',
}

export function saleStatusDotClass(statusLabel: string) {
  return statusDotColors[statusLabel] ?? 'bg-[#737A76]'
}