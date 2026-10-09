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
  totalStock: number
  risk: number
  inventoryStatus: DashboardInventoryStatusItem[]
}

// How the forecast for a product was made (Backend ForecastMethodEnum)
export enum ForecastMethod {
  YearlySsa = 1,
  // Only the ML.NET experiment backend (experiment/mlnet-ssa-forecast) sends this
  ShortSsa = 2,
  Average = 3,
  AverageFallback = 4,
}

// One row of the Demand Forecast & Restock Recommendations card. Demand values are 4-week totals.
export interface DemandForecastItem {
  productId: number
  name: string | null
  lowDemand: number
  expectedDemand: number
  busyDemand: number
  stockOnHand: number
  weeksLeft: number | null
  runsOutAround: string | null
  suggestedOrder: number
  method: ForecastMethod
  historyWeeks: number
  aiErrorPercent: number | null
  baselineErrorPercent: number | null
}

// Backtest over the last 12 weeks: how far off the AI and the simple 4-week average were
export interface ForecastAccuracy {
  aiErrorPercent: number
  baselineErrorPercent: number
  productsTested: number
}

export interface DemandHistoryPoint {
  weekStart: string
  demand: number
}

export interface DemandForecastPoint {
  weekStart: string
  low: number
  expected: number
  busyCase: number
}

/** The same season in an earlier year: 13 weeks before and after the date the forecast starts. */
export interface DemandPastYear {
  year: number
  /** 26 weekly values; null before the product's history. */
  weeks: (number | null)[]
  /** Demand in the 4 weeks lined up with the forecast; null if the history doesn't cover them. */
  sameWeeksTotal: number | null
}

export interface DemandChart {
  product: DemandForecastItem
  /** The 13 weeks before the forecast (fewer for a newer product). */
  history: DemandHistoryPoint[]
  forecast: DemandForecastPoint[]
  /** Newest first. */
  pastYears: DemandPastYear[]
}

// API request/response shapes
export interface InventoryForecastContent {
  forecastResults: DemandForecastItem[]
  pageCount: number
  rows: number
  needOrderCount: number
  accuracy: ForecastAccuracy | null
  generatedAt: string | null
}

export interface FetchInventoryForecastParams {
  forceForecast?: boolean
  page?: number
  pageSize?: number
  search?: string
  needOrderOnly?: boolean
}
