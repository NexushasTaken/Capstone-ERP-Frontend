export interface SalesOverviewPoint {
  data: number
}

export interface SalesOverviewContent {
  data: SalesOverviewPoint[]
  totalSales: number
  growthPercentage: number
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
