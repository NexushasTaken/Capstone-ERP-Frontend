'use client'

import { Search, X, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import CloseButton from '@/app/components/CloseButton'
import AppModal from '@/app/components/modals/AppModal'
import { PaginationDemo } from '@/app/components/Pagination'
import StatusAction from '@/app/components/StatusAction'
import { Button } from '@/components/ui/button'
import type { CategoryListItem, InsertCategoryPayload } from '@/app/types/category'
import { deleteCategory, fetchCategories, insertCategory, updateCategory } from '@/app/utils/api/categoryApi'
import {
  formatCategoryDate,
  formatCategoryId,
} from '@/app/utils/helpers/categoryHelper'
import { editDeleteActions } from '@/app/utils/helpers/statusActionHelpers'
import Loading from '@/app/components/loaders/Loading'
import { queryKeys } from '@/app/utils/api/queryKeys'
import { invalidateCategories } from '@/app/utils/api/queryInvalidation'

const tableColumns = [
  'Id',
  'Type',
  'Created At',
  'Action',
]
const ITEMS_PER_PAGE = 10

export default function CategoryForm() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryListItem | null>(null)
  const [form, setForm] = useState({ type: '' })
  const queryClient = useQueryClient()
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => fetchCategories(),
  })
  const addCategoryMutation = useMutation({
    mutationFn: (payload: InsertCategoryPayload & { optimisticId: number }) =>
      insertCategory({ categoryName: payload.categoryName }),
    onMutate: async ({ categoryName, optimisticId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.all })
      const previous = queryClient.getQueryData<CategoryListItem[]>(queryKeys.categories.all)
      const tempCategory: CategoryListItem = {
        id: optimisticId,
        type: categoryName,
        created_At: new Date().toISOString(),
      }

      queryClient.setQueryData<CategoryListItem[]>(queryKeys.categories.all, (current = []) => [
        tempCategory,
        ...current,
      ])

      return { previous }
    },
    onError: (err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.categories.all, context.previous)
      toast.error(err instanceof Error ? err.message : 'Failed to add category')
    },
    onSuccess: () => toast.success('Category added successfully'),
    onSettled: () => invalidateCategories(queryClient),
  })
  const updateCategoryMutation = useMutation({
    mutationFn: updateCategory,
    onMutate: async ({ id, type }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.all })
      const previous = queryClient.getQueryData<CategoryListItem[]>(queryKeys.categories.all)

      queryClient.setQueryData<CategoryListItem[]>(queryKeys.categories.all, (current = []) =>
        current.map((category) => (category.id === id ? { ...category, type } : category))
      )

      return { previous }
    },
    onError: (err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.categories.all, context.previous)
      toast.error(err instanceof Error ? err.message : 'Failed to update category')
    },
    onSuccess: () => toast.success('Category updated successfully'),
    onSettled: () => invalidateCategories(queryClient),
  })
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onMutate: async (categoryId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.all })
      const previous = queryClient.getQueryData<CategoryListItem[]>(queryKeys.categories.all)

      queryClient.setQueryData<CategoryListItem[]>(queryKeys.categories.all, (current = []) =>
        current.filter((category) => category.id !== categoryId)
      )

      return { previous }
    },
    onError: (err, _categoryId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.categories.all, context.previous)
      toast.error(err instanceof Error ? err.message : 'Failed to delete category')
    },
    onSuccess: () => toast.success('Category deleted successfully'),
    onSettled: () => invalidateCategories(queryClient),
  })
  const isSubmitting =
    addCategoryMutation.isLoading ||
    updateCategoryMutation.isLoading ||
    deleteCategoryMutation.isLoading

  const filteredCategories = useMemo(() => {
    const searchValue = search.trim().toLowerCase()
    if (!searchValue) return categories

    return categories.filter((category) =>
      category.type.toLowerCase().includes(searchValue) ||
      String(category.id).includes(searchValue)
    )
  }, [categories, search])

  const pageCount = Math.max(1, Math.ceil(filteredCategories.length / ITEMS_PER_PAGE))
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  const formCanSubmit = form.type.trim() !== ''

  function resetForm() {
    setForm({ type: '' })
    setSelectedCategory(null)
  }

  async function handleAddCategory() {
    if (!formCanSubmit) return

    const categoryName = form.type.trim()

    setIsAddModalOpen(false)
    resetForm()
    setCurrentPage(1)

    addCategoryMutation.mutate({ categoryName, optimisticId: -Date.now() })
  }

  async function handleUpdateCategory() {
    if (!formCanSubmit || !selectedCategory) return

    const categoryId = selectedCategory.id
    const categoryType = form.type.trim()

    setIsEditModalOpen(false)
    resetForm()

    updateCategoryMutation.mutate({ id: categoryId, type: categoryType })
  }

  async function handleDeleteCategory() {
    if (!selectedCategory) return

    const categoryId = selectedCategory.id

    setIsDeleteModalOpen(false)
    resetForm()
    deleteCategoryMutation.mutate(categoryId)
  }

  function openEditModal(category: CategoryListItem) {
    setSelectedCategory(category)
    setForm({ type: category.type })
    setIsEditModalOpen(true)
  }

  function openDeleteModal(category: CategoryListItem) {
    setSelectedCategory(category)
    setIsDeleteModalOpen(true)
  }

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-2xl bg-white p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-[#121514]">Categories</h1>
          <span className="rounded-md border border-[#DFE2E0] px-3 py-1 text-sm text-[#121514]">
            {categories.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search categories"
              className="w-full rounded-xl border border-[#DFE2E0] bg-white px-3 py-2 text-sm text-[#121514] placeholder:text-[#737A76] focus:border-[#121514] focus:outline-none focus:ring-1 focus:ring-[#121514]"
            />
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setCurrentPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737A76] cursor-pointer transition-colors hover:text-[#121514]"
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <Search className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-[#737A76]" />
            )}
          </div>

          <Button
            className="rounded-xl cursor-pointer px-3 py-2 text-sm"
            onClick={() => {
              resetForm()
              setIsAddModalOpen(true)
            }}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add category
          </Button>
        </div>
      </div>

      <div className="mt-5 min-h-0 overflow-auto scrollbar-none">
        <table className="w-full min-w-150 border-separate border-spacing-y-2 text-left">
          <thead className="text-sm font-normal text-[#737A76]">
            <tr>
              {tableColumns.map((column) => (
                <th
                  className={`px-3 pb-1 font-normal ${column === 'Action' ? 'text-right' : ''}`}
                  key={column}
                  scope="col"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
                  <Loading />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-red-500">
                  {error instanceof Error ? error.message : 'Failed to load categories'}
                </td>
              </tr>
            ) : paginatedCategories.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
                  No categories found.
                </td>
              </tr>
            ) : (
              paginatedCategories.map((category) => (
                <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={category.id}>
                  <td className="rounded-l-xl px-3 py-5 font-medium whitespace-nowrap">{formatCategoryId(category.id)}</td>
                  <td className="px-3 py-5 font-medium whitespace-nowrap capitalize">{category.type}</td>
                  <td className="px-3 py-5 whitespace-nowrap">{formatCategoryDate(category.created_At)}</td>
                  <td className="rounded-r-xl px-3 py-5">
                    <div className="flex items-center justify-end">
                      <StatusAction
                        actions={editDeleteActions}
                        label={`More actions for category ${category.id}`}
                        onAction={(action) => {
                          if (action === 'edit') openEditModal(category)
                          if (action === 'delete') openDeleteModal(category)
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-[#737A76]">
          Showing {paginatedCategories.length} of {filteredCategories.length} categories
        </span>
        <div className="flex">
          <PaginationDemo currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />
        </div>
      </div>

      <AppModal
        className="flex max-h-[90vh] flex-col"
        onClose={() => {
          setIsAddModalOpen(false)
          resetForm()
        }}
        open={isAddModalOpen}
      >
        <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#737A76]">New category item</span>
            <span className="text-xl font-medium text-[#0c0d0d]">Add category</span>
          </div>
          <CloseButton
            onClick={() => {
              setIsAddModalOpen(false)
              resetForm()
            }}
          />
        </div>

        <div className="flex flex-col gap-4 p-4">
          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Category name</span>
            <input
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514] capitalize"
              onChange={(event) => setForm({ type: event.target.value })}
              value={form.type}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
          <Button
            className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
            onClick={() => {
              setIsAddModalOpen(false)
              resetForm()
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl px-3 py-2 text-sm"
            disabled={!formCanSubmit || isSubmitting}
            onClick={handleAddCategory}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add category
          </Button>
        </div>
      </AppModal>

      <AppModal
        className="flex max-h-[90vh] flex-col"
        onClose={() => {
          setIsEditModalOpen(false)
          resetForm()
        }}
        open={isEditModalOpen}
      >
        <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#737A76]">{selectedCategory ? formatCategoryId(selectedCategory.id) : ''}</span>
            <span className="text-xl font-medium text-[#0c0d0d]">Edit category</span>
          </div>
          <CloseButton
            onClick={() => {
              setIsEditModalOpen(false)
              resetForm()
            }}
          />
        </div>

        <div className="flex flex-col gap-4 p-4">
          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Type</span>
            <input
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514] capitalize"
              onChange={(event) => setForm({ type: event.target.value })}
              value={form.type}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
          <Button
            className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
            onClick={() => {
              setIsEditModalOpen(false)
              resetForm()
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl px-3 py-2 text-sm"
            disabled={!formCanSubmit || isSubmitting}
            onClick={handleUpdateCategory}
            type="button"
          >
            Save changes
          </Button>
        </div>
      </AppModal>

      <AppModal
        className="flex max-h-[90vh] flex-col"
        onClose={() => {
          setIsDeleteModalOpen(false)
          resetForm()
        }}
        open={isDeleteModalOpen}
      >
        <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#737A76]">
              {selectedCategory ? formatCategoryId(selectedCategory.id) : ''}
            </span>
            <span className="text-xl font-medium text-[#0c0d0d]">Delete category</span>
          </div>
          <CloseButton
            onClick={() => {
              setIsDeleteModalOpen(false)
              resetForm()
            }}
          />
        </div>

        <div className="flex flex-col gap-2 p-4">
          <span className="text-sm text-[#121514]">
            Are you sure you want to delete this category?
          </span>
          <span className="text-sm font-medium text-[#0c0d0d] capitalize">
            {selectedCategory?.type}
          </span>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
          <Button
            className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
            onClick={() => {
              setIsDeleteModalOpen(false)
              resetForm()
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl px-3 py-2 text-sm"
            disabled={isSubmitting || !selectedCategory}
            onClick={handleDeleteCategory}
            type="button"
            variant="destructive"
          >
            Delete category
          </Button>
        </div>
      </AppModal>
    </section>
  )
}
