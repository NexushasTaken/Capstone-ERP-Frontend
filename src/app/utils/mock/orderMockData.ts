import type { Order, OrderSortOption, OrderStatusFilter } from '@/app/types/order'
import { mockOrderStatuses } from '@/app/utils/mock/orderStatusMockData'

export const mockOrders: Order[] = []

export const orderStatusFilters: OrderStatusFilter[] = [
  { label: 'All', count: mockOrders.length },
  ...mockOrderStatuses.map((status) => ({
    label: status.status,
    count: mockOrders.filter((order) => order.orderStatusId === status.id).length,
  })),
]

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