import type { CategoryListItem } from "@/types/category"
import type {
  CategoryListContent,
  FetchCategoriesParams,
  InsertCategoryPayload,
  RawCategoryListItem,
  UpdateCategoryPayload,
} from "@/types/category"
import { ApiEnvelope, ApiEnvelopeNoContent } from "@/types/api"

function mapCategory(item: RawCategoryListItem): CategoryListItem {
  return {
    id: item.id ?? item.Id ?? 0,
    type: item.type ?? item.Type ?? "",
    created_At: item.created_At ?? item.Created_At ?? "",
  }
}

// GET
export async function fetchCategories(params: FetchCategoriesParams = {}): Promise<{
  items: CategoryListItem[]
  pageCount: number
  rows: number
}> {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set("page", String(params.page))
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize))

  const response = await fetch(`/api/Category/all?${query.toString()}`, {
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`)
  }

  const data: ApiEnvelope<CategoryListContent> = await response.json()

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch categories")
  }

  return {
    items: data.content.categories.map(mapCategory),
    pageCount: data.content.pageCount,
    rows: data.content.rows,
  }
}

// INSERT
export async function insertCategory(payload: InsertCategoryPayload): Promise<ApiEnvelopeNoContent> {
  const query = new URLSearchParams({ categoryName: payload.categoryName })

  const response = await fetch(`/api/Category/insert?${query.toString()}`, {
    method: "POST",
    credentials: "include",
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to add category")
  }

  return data
}

// PATCH
export async function updateCategory(payload: UpdateCategoryPayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch("/api/Category/patch", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update category")
  }

  return data
}

// DELETE
export async function deleteCategory(id: number): Promise<ApiEnvelopeNoContent> {
  const query = new URLSearchParams({ id: String(id) })

  const response = await fetch(`/api/Category/delete?${query.toString()}`, {
    method: "DELETE",
    credentials: "include",
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to delete category")
  }

  return data
}
