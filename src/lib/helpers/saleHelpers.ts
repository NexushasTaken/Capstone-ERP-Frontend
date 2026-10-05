import type { Sale } from '@/types/sale'

export function formatSaleId(saleId: string | number) {
  return `SAL-${saleId}`
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
  Processing: 'bg-amber-500',
  Completed: 'bg-green-600',
  Cancelled: 'bg-destructive',
}

export function saleStatusDotClass(statusLabel: string) {
  return statusDotColors[statusLabel] ?? 'bg-muted-foreground'
}
