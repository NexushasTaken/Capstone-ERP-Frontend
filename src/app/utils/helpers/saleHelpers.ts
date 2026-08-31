import type { Sale } from '@/app/types/sale'

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

export function getOrderForSale(_sale: Sale) {
  void _sale
  return null
}

export function getSaleProductName(_sale: Sale): string {
  void _sale
  return 'Unknown'
}

export function getSaleCustomerName(_sale: Sale): string {
  void _sale
  return 'Unknown'
}

export function getSaleQuantity(_sale: Sale): number {
  void _sale
  return 0
}

export function getSaleStatusLabel(_sale: Sale): string {
  void _sale
  return 'Unknown'
}

const statusDotColors: Record<string, string> = {
  Processing: 'bg-[#F7A33C]',
  Completed: 'bg-[#39B82C]',
  Cancelled: 'bg-[#E75959]',
}

export function saleStatusDotClass(statusLabel: string) {
  return statusDotColors[statusLabel] ?? 'bg-[#737A76]'
}
