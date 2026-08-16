import type { Order, OrderSortOption, OrderStatusFilter } from '@/app/types/order'
import { ORDER_STATUSES } from '@/app/types/order'
import { mockRawMaterials } from '@/app/utils/inventoryMockData'
import { mockSales } from '@/app/utils/saleMockData'

const pickupAddresses = [
  { city: 'Makati City', province: 'Metro Manila', flag: 'PH' },
  { city: 'Cebu City', province: 'Cebu', flag: 'PH' },
  { city: 'Davao City', province: 'Davao del Sur', flag: 'PH' },
  { city: 'Iloilo City', province: 'Iloilo', flag: 'PH' },
  { city: 'San Fernando', province: 'Pampanga', flag: 'PH' },
  { city: 'Cagayan de Oro', province: 'Misamis Oriental', flag: 'PH' },
]

const deliveryAddresses = [
  { city: 'Quezon City', province: 'Metro Manila', flag: 'PH' },
  { city: 'Pasig City', province: 'Metro Manila', flag: 'PH' },
  { city: 'Mandaue City', province: 'Cebu', flag: 'PH' },
  { city: 'General Santos', province: 'South Cotabato', flag: 'PH' },
  { city: 'Bacolod City', province: 'Negros Occidental', flag: 'PH' },
  { city: 'Malolos', province: 'Bulacan', flag: 'PH' },
]

const assignedStaff = [
  'Miguel Santos',
  'Angela Reyes',
  'Carlo Mendoza',
  'Bea Garcia',
  'Paolo Villanueva',
  'Kyla Navarro',
]

export const mockOrders: Order[] = mockSales.map((sale, index) => {
  const inventoryItem = mockRawMaterials[index]
  const orderType = index % 2 === 0 ? 'Deliver' : 'Walk-in'

  return {
    id: `OR-${sale.id.replace('SA-', '')}`,
    inventoryId: inventoryItem.id,
    customerName: sale.customer,
    productName: sale.productName,
    quantity: sale.quantity,
    price: sale.total,
    orderDate: sale.saleDate,
    orderType,
    assignedTo: assignedStaff[index],
    pickupAddress: pickupAddresses[index],
    deliveryAddress: deliveryAddresses[index],
    status: ORDER_STATUSES[index % ORDER_STATUSES.length],
  }
})

export const orderStatusFilters: OrderStatusFilter[] = [
  { label: 'All', count: mockOrders.length },
  ...ORDER_STATUSES.map((status) => ({
    label: status,
    count: mockOrders.filter((order) => order.status === status).length,
  })),
]

export const orderSortOptions: OrderSortOption[] = [
  {
    label: 'Order Date (Newest first)',
    value: 'orderDate',
    order: 'desc',
  },
  {
    label: 'Order Date (Oldest first)',
    value: 'orderDate',
    order: 'asc',
  },
  {
    label: 'Customer (A to Z)',
    value: 'customerName',
    order: 'asc',
  },
  {
    label: 'Customer (Z to A)',
    value: 'customerName',
    order: 'desc',
  },
  {
    label: 'Product (A to Z)',
    value: 'productName',
    order: 'asc',
  },
  {
    label: 'Product (Z to A)',
    value: 'productName',
    order: 'desc',
  },
  {
    label: 'Quantity (High to low)',
    value: 'quantity',
    order: 'desc',
  },
  {
    label: 'Quantity (Low to high)',
    value: 'quantity',
    order: 'asc',
  },
  {
    label: 'Price (High to low)',
    value: 'price',
    order: 'desc',
  },
  {
    label: 'Price (Low to high)',
    value: 'price',
    order: 'asc',
  },
  {
    label: 'Status (A to Z)',
    value: 'status',
    order: 'asc',
  },
]
