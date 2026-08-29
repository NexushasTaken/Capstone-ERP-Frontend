import type { ApiEnvelopeNoContent, InsertProductPayload, ProductListItem } from '@/app/types/product'
import { ApiEnvelope } from '@/app/utils/apiEnvelope'
import { FetchProductsParams, ProductListContent } from '@/app/utils/types/product'

//#region GET
export async function fetchProducts(params: FetchProductsParams = {}): Promise<{
  items: ProductListItem[]
  pageCount: number
  rows: number
}> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.name) query.set('name', params.name)

  const response = await fetch(`/api/Product/all?${query.toString()}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`)
  }

  const data: ApiEnvelope<ProductListContent> = await response.json()

  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch products')
  }

  return {
    items: data.content.products,
    pageCount: data.content.pageCount,
    rows: data.content.rows,
  }
}
//#endregion

//#region INSERT
export async function insertProduct(
  payload: InsertProductPayload,
  existingId?: number
): Promise<ApiEnvelopeNoContent> {
  const query = existingId ? `?id=${existingId}` : ''

  const response = await fetch(`/api/Product/insert${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to add product')
  }

  return data
}
//#endregion