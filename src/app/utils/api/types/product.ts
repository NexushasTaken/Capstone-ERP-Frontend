import type { ProductListItem } from '@/app/types/product'

export interface FetchProductsParams {
  page?: number
  pageSize?: number
  name?: string
  categoryPresent?: 0 | 1
}

export interface ProductListContent {
  products: ProductListItem[]
  pageCount: number
  rows: number
}

export interface InsertProductPayload {
  categoryId: number | null
  name: string
  price: number
}

export interface UpdateProductPayload {
  categoryId: number
  name: string
  price: number
  id: number
}
