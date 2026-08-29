import { ProductListItem } from "@/app/types/product"

export interface FetchProductsParams {
  page?: number
  pageSize?: number
  name?: string
}

export interface ProductListContent {
  products: ProductListItem[]
  pageCount: number
  rows: number
}