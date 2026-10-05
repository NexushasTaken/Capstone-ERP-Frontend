import type { WarehouseListItem } from '@/types/warehouseCapacity'
import { ApiEnvelope, ApiEnvelopeNoContent } from '@/types/api'
import {
  InsertWarehousePayload,
  RawWarehouse,
  UpdateWarehousePayload,
} from '@/types/warehouseCapacity'

// GET
export async function fetchWarehouses(): Promise<WarehouseListItem[]> {
  const response = await fetch(`/api/Inventory/warehouse/all`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch warehouses: ${response.status}`)
  }

  const data: ApiEnvelope<RawWarehouse[]> = await response.json()

  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch warehouses')
  }

  return data.content.map((w) => ({
    id: w.id,
    name: w.name,
    address: w.address,
    stocks: w.stocks,
    capacity: w.capacity ?? w.capicity,
  }))
}

// INSERT
export async function insertWarehouse(payload: InsertWarehousePayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch('/api/Inventory/warehouse/insert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to add warehouse')
  }

  return data
}

// PATCH
export async function updateWarehouse(payload: UpdateWarehousePayload): Promise<ApiEnvelopeNoContent> {
  const response = await fetch('/api/Inventory/warehouse/patch', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update warehouse')
  }

  return data
}

// DELETE
export async function deleteWarehouse(id: number): Promise<ApiEnvelopeNoContent> {
  const query = new URLSearchParams({ id: String(id) })

  const response = await fetch(`/api/Inventory/warehouse/delete?${query.toString()}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  const data: ApiEnvelopeNoContent = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete warehouse')
  }

  return data
}
