import type {
  ApiEnvelopeNoContent,
  CategoryListItem,
  InsertCategoryPayload,
  RawCategoryListItem,
  UpdateCategoryPayload,
} from '@/app/types/category'
import { ApiEnvelope } from '@/app/utils/apiEnvelope'

let categoriesCache: CategoryListItem[] | null = null
let inFlightRequest: Promise<CategoryListItem[]> | null = null

function mapCategory(item: RawCategoryListItem): CategoryListItem {
  return {
    id: item.id ?? item.Id ?? 0,
    type: item.type ?? item.Type ?? '',
    created_By: item.created_By ?? item.Created_By ?? null,
    created_At: item.created_At ?? item.Created_At ?? '',
    updated_By: item.updated_By ?? item.Updated_By ?? null,
    updated_At: item.updated_At ?? item.Updated_At ?? null,
    deleted_By: item.deleted_By ?? item.Deleted_By ?? null,
    deleted_At: item.deleted_At ?? item.Deleted_At ?? null,
    isActive: item.isActive ?? item.IsActive ?? false,
  }
}

// GET
export async function fetchCategories(options?: { force?: boolean }): Promise<CategoryListItem[]> {
  if (categoriesCache && !options?.force) {
    return categoriesCache
  }

  if (inFlightRequest) {
    return inFlightRequest
  }

  inFlightRequest = (async () => {
    const response = await fetch(`/api/Category/all`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`)
    }

    const data: ApiEnvelope<RawCategoryListItem[]> = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch categories')
    }

    const categories = data.content.map(mapCategory)

    categoriesCache = categories
    return categories
  })()

  try {
    return await inFlightRequest
  } finally {
    inFlightRequest = null
  }
}

// INSERT
export async function insertCategory(payload: InsertCategoryPayload): Promise<ApiEnvelopeNoContent> {
  const query = new URLSearchParams({ categoryName: payload.categoryName })

  const response = await fetch(`/api/Category/insert?${query.toString()}`, {
    method: 'POST',
    credentials: 'include',
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to add category')
  }

  invalidateCategoriesCache()
  return data
}

// PATCH
export async function updateCategory(payload: UpdateCategoryPayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch('/api/Category/patch', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update category')
  }

  invalidateCategoriesCache()
  return data
}

// DELETE
export async function deleteCategory(id: number): Promise<ApiEnvelopeNoContent> {
  const query = new URLSearchParams({ id: String(id) })

  const response = await fetch(`/api/Category/delete?${query.toString()}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete category')
  }

  invalidateCategoriesCache()
  return data
}

export function invalidateCategoriesCache() {
  categoriesCache = null
}
