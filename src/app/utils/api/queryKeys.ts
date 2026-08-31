import type { FetchInventoriesParams } from '@/app/utils/types/inventory'
import type { FetchOrdersParams } from '@/app/utils/types/order'
import type { FetchProductsParams } from '@/app/utils/types/product'

export const queryKeys = {
  categories: {
    all: ['categories'] as const,
  },
  inventories: {
    all: (params: FetchInventoriesParams = {}) => ['inventories', params] as const,
  },
  orders: {
    all: (params: FetchOrdersParams = {}) => ['orders', params] as const,
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
