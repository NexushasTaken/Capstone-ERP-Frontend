import type { UnitSortBy, UnitSortOption } from "@/types/unit"

export function formatUnitId(unitId: number) {
  return `UNIT-${unitId}`
}

export const unitSortOptions: UnitSortOption[] = [
  { label: "Latest added", value: "createdAt", order: "desc" },
  { label: "Id", value: "id", order: "asc" },
  { label: "Name (A to Z)", value: "name", order: "asc" },
  { label: "Name (Z to A)", value: "name", order: "desc" },
]

// The backend's `filter` sort code for GET /api/Unit/all.
export function getUnitFilter(sortBy: UnitSortBy, sortOrder: "asc" | "desc") {
  switch (sortBy) {
    case "id":
      return 1
    case "name":
      return sortOrder === "asc" ? 2 : 3
    default:
      return 0
  }
}
