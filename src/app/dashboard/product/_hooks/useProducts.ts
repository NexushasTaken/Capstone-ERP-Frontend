"use client"

import { keepPreviousData, type QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { deleteProduct, fetchProducts, importProducts, insertProduct, updateProduct } from "@/services/productApi"
import { fetchUnits } from "@/services/unitApi"
import { isValidationError } from "@/lib/apiError"
import { invalidateInventories } from "@/lib/query/queryInvalidation"
import { optimisticUpdate } from "@/lib/query/optimisticUpdate"
import { queryKeys } from "@/lib/query/queryKeys"
import type { FetchProductsParams, ProductCategoryFilter, ProductListItem } from "@/types/product"
import { categoryPresentByFilter } from "../_lib/productHelpers"

type ProductsResponse = Awaited<ReturnType<typeof fetchProducts>>

function useProductsQuery(params: FetchProductsParams) {
  return useQuery({
    queryKey: queryKeys.products.all(params),
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData,
  })
}

interface UseProductsParams {
  filter: ProductCategoryFilter
  search: string
  page: number
  pageSize: number
  /** Sort code, see getProductFilter. */
  sort: number
}

/**
 * One sorted page of products for the selected filter, plus the counts shown on the two filter buttons.
 * Search only applies to categorized products.
 */
export function useProducts({ filter, search, page, pageSize, sort }: UseProductsParams) {
  const listParams: FetchProductsParams = {
    page,
    pageSize,
    name: filter === "Uncategorized" ? undefined : search || undefined,
    categoryPresent: categoryPresentByFilter[filter],
    filter: sort,
  }

  const list = useProductsQuery(listParams)
  // The filter buttons only need totals, so ask for a single row and read `rows`.
  const categorized = useProductsQuery({
    page: 1,
    pageSize: 1,
    name: search || undefined,
    categoryPresent: categoryPresentByFilter.Categorized,
  })
  const uncategorized = useProductsQuery({
    page: 1,
    pageSize: 1,
    categoryPresent: categoryPresentByFilter.Uncategorized,
  })

  return {
    list,
    listQueryKey: queryKeys.products.all(listParams),
    countByFilter: {
      Categorized: categorized.data?.rows ?? 0,
      Uncategorized: uncategorized.data?.rows ?? 0,
    } satisfies Record<ProductCategoryFilter, number>,
  }
}

const ALL_UNITS = { page: 1, pageSize: 1000, filter: 2 }

/** Every unit, A to Z, for the product form. */
export function useSelectableUnits() {
  return useQuery({
    queryKey: queryKeys.units.all(ALL_UNITS),
    queryFn: () => fetchUnits(ALL_UNITS),
  })
}

export interface ProductValues {
  name: string
  price: number
  /** 0 means "no category". */
  categoryId: number
  /** Only used to show the right category name before the server responds. */
  categoryName: string | null
  unitId: number
  /** Only used to show the right unit before the server responds. */
  unitName: string | null
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
    mutationFn: ({ categoryId, name, price, unitId }: ProductValues & { optimisticId: number }) =>
      insertProduct({ categoryId, name, price, unitId }),
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
          unitId: values.unitId,
          unitName: values.unitName,
          categoryName: values.categoryName,
          created_At: new Date().toISOString(),
          createdByName: null,
          updated_At: null,
          updatedByName: null,
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
    mutationFn: ({ id, categoryId, name, price, unitId }: ProductValues & { id: number }) =>
      updateProduct({ id, categoryId, name, price, unitId }),
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
                unitId: values.unitId,
                unitName: values.unitName,
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

  // Not optimistic: the modal waits for the result so it can show row errors from a 400.
  const importProductsMutation = useMutation({
    mutationFn: importProducts,
    onSuccess: (count) => {
      toast.success(`Imported ${count} product(s)`)
      queryClient.invalidateQueries({ queryKey: ["products"] })
      // Rows with a quantity also add stock records.
      invalidateInventories(queryClient)
    },
    onError: (err) => {
      if (!isValidationError(err)) toast.error(err.message || "Failed to import products")
    },
  })

  return {
    addProduct,
    importProducts: importProductsMutation,
    updateProduct: updateProductMutation,
    deleteProduct: deleteProductMutation,
    isSubmitting: addProduct.isPending || updateProductMutation.isPending || deleteProductMutation.isPending,
  }
}
