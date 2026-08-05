import type { SaleStatus } from '@/app/types/sale'

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

export function saleStatusDotClass(status: SaleStatus) {
  const statusColors: Record<SaleStatus, string> = {
    Paid: 'bg-[#39B82C]',
    Processing: 'bg-[#F7A33C]',
    Delivered: 'bg-[#377EEA]',
    Refunded: 'bg-[#E75959]',
  }

  return statusColors[status]
}
