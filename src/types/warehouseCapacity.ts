export interface WarehouseListItem {
  id: number
  name: string
  address: string
  stocks: number
  capacity: number
}

// API request/response shapes

export interface RawWarehouse {
  id: number
  name: string
  address: string
  stocks: number
  capicity: number
  capacity?: number
}

export interface InsertWarehousePayload {
  name: string
  address: string
  capicity: number
}

export interface UpdateWarehousePayload extends InsertWarehousePayload {
  id: number
}
