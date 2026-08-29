import type { WarehouseListItem } from '@/app/types/warehouseCapacity'
import { ApiEnvelope } from '@/app/utils/apiEnvelope'
import { RawWarehouse } from '@/app/utils/types/warehouseCapacity'

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
      capacity: w.capacity,
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