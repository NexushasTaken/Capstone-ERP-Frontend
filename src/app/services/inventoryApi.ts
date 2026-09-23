import type { StatusCount } from '@/app/utils/api/types/statusCount'
import type { InventoryListItem, InventoryMovementItem, InventoryDamageItem } from '@/app/types/inventory'
import type { ProductListItem } from '@/app/types/product'
import { ApiEnvelope, ApiEnvelopeNoContent } from '@/app/utils/api/apiEnvelope'
import type {
  FetchInventoriesParams,
  FetchInventoryVelocityParams,
  InventoryVelocityContent,
  MarkInventoryAsDamagePayload,
  RestockInventoryPayload,
  InsertInventoryPayload,
  InventoryListContent,
  UpdateInventoryPayload,
} from '@/app/utils/api/types/inventory'

// GET
export async function fetchInventoryProducts(signal?: AbortSignal): Promise<ProductListItem[]> {
  const response = await fetch('/api/Inventory/insert/product/all', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    signal,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch inventory products: ${response.status}`)
  }

  const data: ApiEnvelope<ProductListItem[]> = await response.json()

  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch inventory products')
  }

  return data.content
}

// GET
export async function fetchInventoryVelocity(params: FetchInventoryVelocityParams) {
  const query = new URLSearchParams({ cutOffDate: String(params.cutOffDate) })
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.pageSize !== undefined) query.set('pageSize', String(params.pageSize))

  const response = await fetch(`/api/Inventory/movement/velocity?${query}`, {
    method: 'GET',
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch inventory velocity: ${response.status}`)
  }
  const data: ApiEnvelope<InventoryVelocityContent> = await response.json()
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch inventory velocity')
  }
  return {
    items: data.content.inventories,
    pageCount: data.content.pageCount,
    rows: data.content.rows,
  }
}

// GET
export async function fetchInventories(params: FetchInventoriesParams = {}): Promise<{
  items: InventoryListItem[]
  pageCount: number
  rows: number
}> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.name) query.set('name', params.name)
  if (params.statusId !== undefined) query.set('statusId', String(params.statusId))
  if (params.filter !== undefined) query.set('filter', String(params.filter))

  const response = await fetch(`/api/Inventory/all?${query.toString()}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch inventories: ${response.status}`)
  }

  const data: ApiEnvelope<InventoryListContent> = await response.json()

  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch inventories')
  }

  return {
    items: data.content.inventories,
    pageCount: data.content.pageCount,
    rows: data.content.rows,
  }
}

// INSERT
export async function insertInventory(
  payload: InsertInventoryPayload,
  existingId?: number
): Promise<ApiEnvelopeNoContent> {
  const query = existingId ? `?id=${existingId}` : ''

  const response = await fetch(`/api/Inventory/insert${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to add inventory item')
  }

  return data
}

// PATCH
export async function updateInventory(payload: UpdateInventoryPayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch('/api/Inventory/patch', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update inventory item')
  }

  return data
}

// PATCH
export async function markInventoryAsDamage(payload: MarkInventoryAsDamagePayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch('/api/Inventory/markasdamage', {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload),
  })
  const data: ApiEnvelopeNoContent = await response.json()
  if (!response.ok || !data.success) throw new Error(data.message || 'Failed to mark inventory as damaged')
  return data
}

export async function restockInventory(payload: RestockInventoryPayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch('/api/Inventory/restock', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data: ApiEnvelopeNoContent = await response.json()
  if (!response.ok || !data.success) throw new Error(data.message || 'Failed to restock inventory')
  return data
}

// DELETE
export async function deleteInventory(id: number): Promise<ApiEnvelopeNoContent> {
  const query = new URLSearchParams({ id: String(id) })

  const response = await fetch(`/api/Inventory/delete?${query.toString()}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete inventory item')
  }

  return data
}

export async function fetchInventoryMovements(id: number): Promise<InventoryMovementItem[]> {
  const query = new URLSearchParams({ id: String(id) })
  const response = await fetch('/api/Inventory/movement/item?' + query, {
    method: 'GET',
    credentials: 'include',
  })
  const data: ApiEnvelope<InventoryMovementItem[]> = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch inventory movement records')
  }
  return [...data.content].sort((a, b) => Date.parse(b.created_At) - Date.parse(a.created_At))
}

export async function fetchInventoryDamageRecords(id: number): Promise<InventoryDamageItem[]> {
  const query = new URLSearchParams({ id: String(id) })
  const response = await fetch('/api/Inventory/damage/item?' + query, {
    method: 'GET',
    credentials: 'include',
  })
  const data: ApiEnvelope<InventoryDamageItem[]> = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch inventory damage records')
  }
  return [...data.content].sort((a, b) => Date.parse(b.created_At) - Date.parse(a.created_At))
}

export async function fetchInventoryStatusCounts(signal?: AbortSignal): Promise<StatusCount[]> {
  const response = await fetch('/api/Inventory/status/count', {
    credentials: 'include',
    cache: 'no-store',
    signal,
  })
  if (!response.ok) throw new Error('Failed to fetch inventory status counts: ' + response.status)
  const data: ApiEnvelope<StatusCount[]> = await response.json()
  if (!data.success) throw new Error(data.message || 'Failed to fetch status counts')
  return data.content
}
