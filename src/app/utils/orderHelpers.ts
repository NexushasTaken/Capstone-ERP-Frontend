import type { OrderStatus, OrderType, PhilippineLocation } from '@/app/types/order'

export function formatOrderId(orderId: string) {
  return `#${orderId}`
}

export function formatPhilippineLocation(location: PhilippineLocation) {
  return `${location.city}, ${location.province}`
}

export function statusDotClass(status: OrderStatus) {
  const statusColors: Record<OrderStatus, string> = {
    Processing: 'bg-[#FFB020]',
    Completed: 'bg-[#39B82C]',
    Cancelled: 'bg-[#D92D20]',
  }

  return statusColors[status]
}

export function statusTextClass(status: OrderStatus) {
  const statusColors: Record<OrderStatus, string> = {
    Processing: 'text-[#9A5B00]',
    Completed: 'text-[#1F7A1F]',
    Cancelled: 'text-[#B42318]',
  }

  return statusColors[status]
}

export function orderTypeLabel(type: OrderType) {
  return type === 'Deliver' ? 'Deliver' : 'Walk-in'
}
