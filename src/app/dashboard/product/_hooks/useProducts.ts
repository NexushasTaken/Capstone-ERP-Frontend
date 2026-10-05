"use client"

import { keepPreviousData, type QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteProduct, fetchProducts, insertProduct, updateProduct } from "@/services/productApi"
import { optimisticUpdate } from "@/lib/query/optimisticUpdate"
import { queryKeys } from "@/lib/query/queryKeys"
import type { FetchProductsParams, ProductCategoryFilter, ProductListItem } from "@/types/product"
import { categoryPresentByFilter, PRODUCT_LOAD_PAGE_SIZE } from "../_lib/productHelpers"

type ProductsResponse = Awaited<ReturnType<typeof fetchProducts>>

function useProductsQuery(params: FetchProductsParams) {
  return useQuery({
    queryKey: queryKeys.products.all(params),
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData,
  })
}

/**
 * Products for the selected filter, plus the counts shown on the two filter buttons.
 * Search only applies to categorized products.
 */
export function useProducts(filter: ProductCategoryFilter, search: string) {
  const listParams: FetchProductsParams = {
    page: 1,
    pageSize: PRODUCT_LOAD_PAGE_SIZE,
    name: filter === "Uncategorized" ? undefined : search || undefined,
    categoryPresent: categoryPresentByFilter[filter],
  }

  const list = useProductsQuery(listParams)
  const categorized = useProductsQuery({
    page: 1,
    pageSize: PRODUCT_LOAD_PAGE_SIZE,
    name: search || undefined,
    categoryPresent: categoryPresentByFilter.Categorized,
  })
  const uncategorized = useProductsQuery({
    page: 1,
    pageSize: PRODUCT_LOAD_PAGE_SIZE,
    categoryPresent: categoryPresentByFilter.Uncategorized,
  })

  return {
    list,
    listQueryKey: queryKeys.products.all(listParams),
    categorizedItems: categorized.data?.items,
    uncategorizedItems: uncategorized.data?.items,
  }
}

export interface ProductValues {
  name: string
  price: number
  /** 0 means "no category". */
  categoryId: number
  /** Only used to show the right category name before the server responds. */
  categoryName: string | null
}

// Add/edit/delete for the products page. Each one updates the visible list in the cache straight away.
export function useProductMutations(listQueryKey: QueryKey, filter: ProductCategoryFilter) {
  const queryClient = useQueryClient()
  const shared = {
    queryClient,
    queryKey: listQueryKey,
    scopeKey: ["products"],
  }

  const addProduct = useMutation({
    mutationFn: ({ categoryId, name, price }: ProductValues & { optimisticId: number }) =>
      insertProduct({ categoryId, name, price }),
    ...optimisticUpdate<ProductsResponse, ProductValues & { optimisticId: number }>({
      ...shared,
      update: (current, values) => {
        const belongsToCurrentFilter = values.categoryId === 0 ? filter === "Uncategorized" : filter === "Categorized"
        if (!belongsToCurrentFilter) return current

        const optimisticProduct: ProductListItem = {
          id: values.optimisticId,
          categoryId: values.categoryId || null,
          name: values.name,
          price: values.price,
          categoryName: values.categoryName,
          created_At: new Date().toISOString(),
        }
        return {
          ...current,
          items: [optimisticProduct, ...current.items],
          rows: current.rows + 1,
        }
      },
      successMessage: "Product added successfully",
      errorMessage: "Failed to add product",
    }),
  })

  const updateProductMutation = useMutation({
    mutationFn: ({ id, categoryId, name, price }: ProductValues & { id: number }) =>
      updateProduct({ id, categoryId, name, price }),
    ...optimisticUpdate<ProductsResponse, ProductValues & { id: number }>({
      ...shared,
      update: (current, values) => ({
        ...current,
        items: current.items.map((product) =>
          product.id === values.id
            ? {
                ...product,
                categoryId: values.categoryId || null,
                name: values.name,
                price: values.price,
                categoryName: values.categoryName,
              }
            : product,
        ),
      }),
      successMessage: "Product updated successfully",
      errorMessage: "Failed to update product",
    }),
  })

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    ...optimisticUpdate<ProductsResponse, number>({
      ...shared,
      update: (current, productId) => ({
        ...current,
        items: current.items.filter((product) => product.id !== productId),
        rows: Math.max(current.rows - 1, 0),
      }),
      successMessage: "Product deleted successfully",
      errorMessage: "Failed to delete product",
    }),
  })

  return {
    addProduct,
    updateProduct: updateProductMutation,
    deleteProduct: deleteProductMutation,
    isSubmitting: addProduct.isPending || updateProductMutation.isPending || deleteProductMutation.isPending,
  }
}
