import type { FetchInventoriesParams, FetchInventoryVelocityParams } from "@/types/inventory"
import type { FetchOrdersParams } from "@/types/order"
import type { FetchProductsParams } from "@/types/product"
import type { FetchDriversParams } from "@/types/driver"
import type { FetchSalesParams } from "@/types/sale"
import type { FetchInventoryForecastParams } from "@/types/dashboard"
import type { FetchCategoriesParams } from "@/types/category"
import type { FetchAuditLogsParams } from "@/types/auditLog"

export const queryKeys = {
  categories: {
    all: (params: FetchCategoriesParams = {}) => ["categories", params] as const,
  },
  drivers: {
    all: (params: FetchDriversParams = {}) => ["drivers", params] as const,
  },
  dashboard: {
    salesOverview: (params: { from: string; to: string }) => ["dashboard", "salesOverview", params] as const,
    inventory: ["dashboard", "inventory"] as const,
    inventoryForecast: (params: FetchInventoryForecastParams = {}) =>
      ["dashboard", "inventory", "forecast", params] as const,
  },
  inventories: {
    productsForInsert: ["inventories", "productsForInsert"] as const,
    statusCounts: ["inventories", "statusCounts"] as const,
    movements: (id: number | null) => ["inventories", "movements", id] as const,
    damageRecords: (id: number | null) => ["inventories", "damageRecords", id] as const,
    velocity: (params: FetchInventoryVelocityParams) => ["inventories", "velocity", params] as const,
    all: (params: FetchInventoriesParams = {}) => ["inventories", params] as const,
  },
  orders: {
    statusCounts: ["orders", "statusCounts"] as const,
    all: (params: FetchOrdersParams = {}) => ["orders", params] as const,
    types: ["orders", "types"] as const,
    statuses: ["orders", "statuses"] as const,
    riders: ["orders", "riders"] as const,
  },
  products: {
    all: (params: FetchProductsParams = {}) => ["products", params] as const,
  },
  sales: {
    all: (params: FetchSalesParams = {}) => ["sales", params] as const,
  },
  warehouses: {
    all: ["warehouses"] as const,
  },
  auditLogs: {
    all: (params: FetchAuditLogsParams = {}) => ["auditLogs", params] as const,
  },
  users: {
    all: ["users"] as const,
  },
  accounts: {
    all: ["accounts"] as const,
  },
  profile: {
    info: ["profile", "info"] as const,
  },

  auth: {
    currentUser: ["auth", "currentUser"] as const,
  },
}
