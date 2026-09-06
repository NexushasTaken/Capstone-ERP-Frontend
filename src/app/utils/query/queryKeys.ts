import type { FetchInventoriesParams, FetchInventoryVelocityParams } from '@/app/utils/api/types/inventory'
import type { FetchOrdersParams } from '@/app/utils/api/types/order'
import type { FetchProductsParams } from '@/app/utils/api/types/product'

export const queryKeys = {
  categories: {
    all: ['categories'] as const,
  },
  inventories: {
    movements: (id: number | null) => ['inventories', 'movements', id] as const,
    damageRecords: (id: number | null) => ['inventories', 'damageRecords', id] as const,
    entryTypes: ['inventoryEntryTypes'] as const,
    velocity: (params: FetchInventoryVelocityParams) => ['inventories', 'velocity', params] as const,
    all: (params: FetchInventoriesParams = {}) => ['inventories', params] as const,
  },
  orders: {
    all: (params: FetchOrdersParams = {}) => ['orders', params] as const,
    types: ['orders', 'types'] as const,
    statuses: ['orders', 'statuses'] as const,
    riders: ['orders', 'riders'] as const,
  },
  products: {
    all: (params: FetchProductsParams = {}) => ['products', params] as const,
  },
  warehouses: {
    all: ['warehouses'] as const,
  },

  auth: {
    currentUser: ['auth', 'currentUser'] as const,
  },
}
