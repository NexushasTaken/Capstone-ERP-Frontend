import type { FetchInventoriesParams } from '@/app/utils/types/inventory'
import type { FetchProductsParams } from '@/app/utils/types/product'

export const queryKeys = {
  categories: {
    all: ['categories'] as const,
  },
  inventories: {
    all: (params: FetchInventoriesParams = {}) => ['inventories', params] as const,
  },
  products: {
    all: (params: FetchProductsParams = {}) => ['products', params] as const,
  },
  warehouses: {
    all: ['warehouses'] as const,
  },
}
