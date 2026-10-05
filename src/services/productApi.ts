import type { ProductListItem } from "@/types/product"
import { ApiEnvelope, ApiEnvelopeNoContent } from "@/types/api"
import type {
  FetchProductsParams,
  ProductListContent,
  InsertProductPayload,
  UpdateProductPayload,
} from "@/types/product"

// GET
export async function fetchProducts(params: FetchProductsParams = {}): Promise<{
  items: ProductListItem[]
  pageCount: number
  rows: number
}> {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.pageSize) query.set("pageSize", String(params.pageSize))
  if (params.name) query.set("name", params.name)
  if (params.categoryPresent !== undefined) query.set("categoryPresent", String(params.categoryPresent))

  const response = await fetch(`/api/Product/all?${query.toString()}`, {
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`)
  }

  const data: ApiEnvelope<ProductListContent> = await response.json()

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch products")
  }

  return {
    items: data.content.products,
    pageCount: data.content.pageCount,
    rows: data.content.rows,
  }
}

// INSERT
export async function insertProduct(payload: InsertProductPayload, existingId?: number): Promise<ApiEnvelopeNoContent> {
  const query = existingId ? `?id=${existingId}` : ""

  const response = await fetch(`/api/Product/insert${query}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to add product")
  }

  return data
}

// PATCH
export async function updateProduct(payload: UpdateProductPayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch("/api/Product/patch", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update product")
  }

  return data
}

// DELETE
export async function deleteProduct(id: number): Promise<ApiEnvelopeNoContent> {
  const query = new URLSearchParams({ id: String(id) })

  const response = await fetch(`/api/Product/delete?${query.toString()}`, {
    method: "DELETE",
    credentials: "include",
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to delete product")
  }

  return data
}
