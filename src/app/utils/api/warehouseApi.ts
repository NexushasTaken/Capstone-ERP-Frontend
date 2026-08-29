import type { WarehouseListItem } from '@/app/types/warehouseCapacity'
import { ApiEnvelope, ApiEnvelopeNoContent } from '@/app/utils/apiEnvelope'
import {
  InsertWarehousePayload,
  RawWarehouse,
  UpdateWarehousePayload,
} from '@/app/utils/types/warehouseCapacity'

let warehousesCache: WarehouseListItem[] | null = null
let inFlightRequest: Promise<WarehouseListItem[]> | null = null

// GET
export async function fetchWarehouses(options?: { force?: boolean }): Promise<WarehouseListItem[]> {
  if (warehousesCache && !options?.force) {
    return warehousesCache
  }

  if (inFlightRequest) {
    return inFlightRequest
  }

  inFlightRequest = (async () => {
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

    const mapped: WarehouseListItem[] = data.content.map((w) => ({
      id: w.id,
      name: w.name,
      address: w.address,
      stocks: w.stocks,
      capacity: w.capacity ?? w.capicity,
    }))

    warehousesCache = mapped
    return mapped
  })()

  try {
    return await inFlightRequest
  } finally {
    inFlightRequest = null
  }
}

export function invalidateWarehousesCache() {
  warehousesCache = null
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

  invalidateWarehousesCache()
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

  invalidateWarehousesCache()
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

  invalidateWarehousesCache()
  return data
}
