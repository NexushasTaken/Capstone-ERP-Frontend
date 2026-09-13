import type { Sale } from '@/app/types/sale'

export function formatSaleId(saleId: string | number) {
  return `SAL-${saleId}`
}

export function formatPeso(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string | null) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getOrderForSale(_sale: Sale) {
  void _sale
  return null
}

export function getSaleProductName(sale: Sale): string {
  if (sale.orders.length === 0) return '-'
  if (sale.orders.length === 1) return sale.orders[0].productName

  return `${sale.orders[0].productName} +${sale.orders.length - 1} more`
}

export function getSaleCustomerName(sale: Sale): string {
  return sale.customerName
}

export function getSaleQuantity(sale: Sale): number {
  return sale.orders.reduce((sum, order) => sum + order.quantity, 0)
}

export function getSaleStatusLabel(sale: Sale): string {
  return sale.orderStatus
}

const statusDotColors: Record<string, string> = {
  Processing: 'bg-[#F7A33C]',
  Completed: 'bg-[#39B82C]',
  Cancelled: 'bg-[#E75959]',
}

export function saleStatusDotClass(statusLabel: string) {
  return statusDotColors[statusLabel] ?? 'bg-[#737A76]'
}
