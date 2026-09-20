export interface SalesOverviewPoint {
  data: number
}

export interface SalesOverviewContent {
  data: SalesOverviewPoint[]
  totalSales: number
  growthPercentage: number
  growthErrorMessage?: string | null
}

export interface FetchSalesOverviewParams {
  from: string
  to: string
}

export interface DashboardInventoryStatusItem {
  status: string
  total: number
}

export interface DashboardInventoryContent {
  totalWareHouseCapacity: number
  risk: number
  inventoryStatus: DashboardInventoryStatusItem[]
}

export interface InventoryForecastItem {
  inventoryId: number
  name: string
  earliestStockOutDay: string
}

export interface InventoryForecastContent {
  forecastResults: InventoryForecastItem[]
  pageCount: number
  rows: number
}

export interface FetchInventoryForecastParams {
  forceForecast?: boolean
  page?: number
  pageSize?: number
}
