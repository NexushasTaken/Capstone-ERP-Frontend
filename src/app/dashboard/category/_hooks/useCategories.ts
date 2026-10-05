"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteCategory, fetchCategories, insertCategory, updateCategory } from "@/services/categoryApi"
import { optimisticUpdate } from "@/lib/query/optimisticUpdate"
import { queryKeys } from "@/lib/query/queryKeys"
import type { CategoryListItem, FetchCategoriesParams } from "@/types/category"
import { ITEMS_PER_PAGE } from "../_lib/categoryHelpers"

type CategoriesResponse = Awaited<ReturnType<typeof fetchCategories>>

export interface CategoriesQuery {
  page: number
  search: string
  /** Sort code, see getCategoryFilter. */
  sort: number
}

function categoriesParams({ page, search, sort }: CategoriesQuery): FetchCategoriesParams {
  return { page, pageSize: ITEMS_PER_PAGE, name: search || undefined, filter: sort }
}

export function useCategories(query: CategoriesQuery) {
  const params = categoriesParams(query)
  return useQuery({
    queryKey: queryKeys.categories.all(params),
    queryFn: () => fetchCategories(params),
    placeholderData: keepPreviousData,
  })
}

// Add/edit/delete for the categories page. Each one updates the visible page in the cache straight away.
export function useCategoryMutations(query: CategoriesQuery) {
  const queryClient = useQueryClient()
  const shared = {
    queryClient,
    queryKey: queryKeys.categories.all(categoriesParams(query)),
    scopeKey: ["categories"],
  }

  const addCategory = useMutation({
    mutationFn: ({ categoryName }: { categoryName: string; optimisticId: number }) => insertCategory({ categoryName }),
    ...optimisticUpdate<CategoriesResponse, { categoryName: string; optimisticId: number }>({
      ...shared,
      update: (current, { categoryName, optimisticId }) => {
        const tempCategory: CategoryListItem = {
          id: optimisticId,
          type: categoryName,
          created_At: new Date().toISOString(),
        }
        return {
          ...current,
          items: [tempCategory, ...current.items].slice(0, ITEMS_PER_PAGE),
          rows: current.rows + 1,
        }
      },
      successMessage: "Category added successfully",
      errorMessage: "Failed to add category",
    }),
  })

  const updateCategoryMutation = useMutation({
    mutationFn: updateCategory,
    ...optimisticUpdate<CategoriesResponse, { id: number; type: string }>({
      ...shared,
      update: (current, { id, type }) => ({
        ...current,
        items: current.items.map((category) => (category.id === id ? { ...category, type } : category)),
      }),
      successMessage: "Category updated successfully",
      errorMessage: "Failed to update category",
    }),
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    ...optimisticUpdate<CategoriesResponse, number>({
      ...shared,
      update: (current, categoryId) => ({
        ...current,
        items: current.items.filter((category) => category.id !== categoryId),
        rows: Math.max(0, current.rows - 1),
      }),
      successMessage: "Category deleted successfully",
      errorMessage: "Failed to delete category",
    }),
  })

  return {
    addCategory,
    updateCategory: updateCategoryMutation,
    deleteCategory: deleteCategoryMutation,
    isSubmitting: addCategory.isPending || updateCategoryMutation.isPending || deleteCategoryMutation.isPending,
  }
}
