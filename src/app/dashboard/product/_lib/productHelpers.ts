import type { ProductCategoryFilter, ProductSortBy, ProductSortOption } from "@/types/product"

export const productFilters: ProductCategoryFilter[] = ["Categorized", "Uncategorized"]

export const categoryPresentByFilter: Record<ProductCategoryFilter, 0 | 1> = {
  Categorized: 0,
  Uncategorized: 1,
}

export const productSortOptions: ProductSortOption[] = [
  { label: "Latest added", value: "createdAt", order: "desc" },
  { label: "Id", value: "id", order: "asc" },
  { label: "Product Name (A to Z)", value: "name", order: "asc" },
  { label: "Product Name (Z to A)", value: "name", order: "desc" },
  { label: "Price Low", value: "price", order: "asc" },
  { label: "Price High", value: "price", order: "desc" },
]

export function formatProductId(productId: string | number) {
  return `PR-${productId}`
}

// The backend's `filter` sort code for GET /api/Product/all.
export function getProductFilter(sortBy: ProductSortBy, sortOrder: "asc" | "desc") {
  switch (sortBy) {
    case "id":
      return 1
    case "name":
      return sortOrder === "asc" ? 2 : 3
    case "price":
      return sortOrder === "asc" ? 4 : 5
    default:
      return 0
  }
}
