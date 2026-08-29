import type { InventoryListItem } from '@/app/types/inventory'
import { ApiEnvelope, ApiEnvelopeNoContent } from '@/app/utils/apiEnvelope'
import {
  FetchInventoriesParams,
  InsertInventoryPayload,
  InventoryListContent,
  UpdateInventoryPayload,
} from '@/app/utils/types/inventory'

// GET
export async function fetchInventories(params: FetchInventoriesParams = {}): Promise<{
  items: InventoryListItem[]
  pageCount: number
  rows: number
}> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.searchString) query.set('searchString', params.searchString)
  if (params.filter !== undefined) query.set('filter', String(params.filter))
  if (params.statusId !== undefined) query.set('statusId', String(params.statusId))

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
