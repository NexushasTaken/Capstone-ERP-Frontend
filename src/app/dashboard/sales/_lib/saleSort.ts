import type { SaleSortBy, SaleSortOption } from "@/types/sale"

export const saleSortOptions: SaleSortOption[] = [
  { label: "Newest first", value: "date", order: "desc" },
  { label: "Oldest first", value: "date", order: "asc" },
  { label: "Total (high to low)", value: "total", order: "desc" },
  { label: "Total (low to high)", value: "total", order: "asc" },
  { label: "Customer (A to Z)", value: "customer", order: "asc" },
  { label: "Customer (Z to A)", value: "customer", order: "desc" },
]

// The backend's `filter` sort code for GET /api/Sale/all.
export function getSaleFilter(sortBy: SaleSortBy, sortOrder: "asc" | "desc") {
  switch (sortBy) {
    case "total":
      return sortOrder === "desc" ? 2 : 3
    case "customer":
      return sortOrder === "asc" ? 4 : 5
    default:
      return sortOrder === "desc" ? 0 : 1
  }
}
