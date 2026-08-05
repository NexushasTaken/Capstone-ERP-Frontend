export type OrderStatus = 'Pending' | 'Responded' | 'Assigned' | 'Completed' | 'Picked up' | 'In transit'

export interface PhilippineLocation {
  city: string
  province: string
  flag: string
}

export interface Order {
  id: string
  assignedTo: string
  pickupAddress: PhilippineLocation
  deliveryAddress: PhilippineLocation
  estimatedDelivery: string
  status: OrderStatus
}

export interface OrderStatusFilter {
  label: Exclude<OrderStatus, 'Picked up' | 'In transit'>
  count: number
}
