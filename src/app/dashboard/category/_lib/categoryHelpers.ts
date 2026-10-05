import type { CategoryListItem, CategorySortBy, CategorySortOption } from "@/types/category"

export const ITEMS_PER_PAGE = 10

export const categorySortOptions: CategorySortOption[] = [
  { label: "Latest added", value: "createdAt", order: "desc" },
  { label: "Id", value: "id", order: "asc" },
  { label: "Type (A to Z)", value: "name", order: "asc" },
  { label: "Type (Z to A)", value: "name", order: "desc" },
]

export function formatCategoryId(categoryId: string | number) {
  return `CAT-${categoryId}`
}

// Search and sort happen in the browser on the current page (the backend has no search/sort for categories).
export function filterAndSortCategories(
  categories: CategoryListItem[],
  search: string,
  sortBy: CategorySortBy,
  sortOrder: "asc" | "desc",
) {
  const searchValue = search.trim().toLowerCase()
  const matched = searchValue
    ? categories.filter(
        (category) => category.type.toLowerCase().includes(searchValue) || String(category.id).includes(searchValue),
      )
    : categories
  const direction = sortOrder === "asc" ? 1 : -1

  return [...matched].sort((a, b) => {
    switch (sortBy) {
      case "id":
        return (a.id - b.id) * direction
      case "name":
        return a.type.localeCompare(b.type) * direction
      case "createdAt":
        return (Date.parse(a.created_At) - Date.parse(b.created_At)) * direction
      default:
        return 0
    }
  })
}
