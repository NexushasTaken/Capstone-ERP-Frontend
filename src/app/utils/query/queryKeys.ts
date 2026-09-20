import type { FetchInventoriesParams, FetchInventoryVelocityParams } from '@/app/utils/api/types/inventory'
import type { FetchOrdersParams } from '@/app/utils/api/types/order'
import type { FetchProductsParams } from '@/app/utils/api/types/product'
import type { FetchDriversParams } from '@/app/utils/api/types/driver'
import type { FetchSalesParams } from '@/app/utils/api/types/sale'
import type { FetchInventoryForecastParams } from '@/app/utils/api/types/dashboard'

export const queryKeys = {
  categories: {
    all: ['categories'] as const,
  },
  drivers: {
    all: (params: FetchDriversParams = {}) => ['drivers', params] as const,
  },
  dashboard: {
    salesOverview: (params: { from: string; to: string }) => ['dashboard', 'salesOverview', params] as const,
    inventory: ['dashboard', 'inventory'] as const,
    inventoryForecast: (params: FetchInventoryForecastParams = {}) =>
      ['dashboard', 'inventory', 'forecast', params] as const,
  },
  inventories: {
    statusCounts: ['inventories', 'statusCounts'] as const,
    movements: (id: number | null) => ['inventories', 'movements', id] as const,
    damageRecords: (id: number | null) => ['inventories', 'damageRecords', id] as const,
    velocity: (params: FetchInventoryVelocityParams) => ['inventories', 'velocity', params] as const,
    all: (params: FetchInventoriesParams = {}) => ['inventories', params] as const,
  },
  orders: {
    statusCounts: ['orders', 'statusCounts'] as const,
    all: (params: FetchOrdersParams = {}) => ['orders', params] as const,
    types: ['orders', 'types'] as const,
    statuses: ['orders', 'statuses'] as const,
    riders: ['orders', 'riders'] as const,
  },
  products: {
    all: (params: FetchProductsParams = {}) => ['products', params] as const,
  },
  sales: {
    all: (params: FetchSalesParams = {}) => ['sales', params] as const,
  },
  warehouses: {
    all: ['warehouses'] as const,
  },

  auth: {
    currentUser: ['auth', 'currentUser'] as const,
  },
}
