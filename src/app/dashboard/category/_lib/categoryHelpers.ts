import type { CategorySortBy, CategorySortOption } from "@/types/category"

export const categorySortOptions: CategorySortOption[] = [
  { label: "Latest added", value: "createdAt", order: "desc" },
  { label: "Id", value: "id", order: "asc" },
  { label: "Type (A to Z)", value: "name", order: "asc" },
  { label: "Type (Z to A)", value: "name", order: "desc" },
]

export function formatCategoryId(categoryId: string | number) {
  return `CAT-${categoryId}`
}

// The backend's `filter` sort code for GET /api/Category/all.
export function getCategoryFilter(sortBy: CategorySortBy, sortOrder: "asc" | "desc") {
  switch (sortBy) {
    case "id":
      return 1
    case "name":
      return sortOrder === "asc" ? 2 : 3
    default:
      return 0
  }
}
