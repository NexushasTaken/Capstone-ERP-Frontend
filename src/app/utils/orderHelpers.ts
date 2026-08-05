import type { OrderStatus, PhilippineLocation } from '@/app/types/order'

export function formatOrderId(orderId: string) {
  return `#${orderId}`
}

export function formatPhilippineLocation(location: PhilippineLocation) {
  return `${location.city}, ${location.province}`
}

export function statusDotClass(status: OrderStatus) {
  return status === 'In transit' ? 'bg-[#39B82C]' : 'bg-[#FF7A2F]'
}
