"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import ListHeader from "@/components/ListHeader"
import SearchInput from "@/components/SearchInput"
import SortPopover from "@/components/SortPopover"
import { TablePagination } from "@/components/TablePagination"
import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { editDeleteActions } from "@/lib/helpers/statusActionHelpers"
import { allowedActions, can } from "@/lib/permissions"
import type { CategoryListItem, CategorySortBy } from "@/types/category"
import { useCategories, useCategoryMutations } from "../_hooks/useCategories"
import { categorySortOptions, formatCategoryId, getCategoryFilter } from "../_lib/categoryHelpers"
import CategoriesTable from "./CategoriesTable"
import CategoryFormModal from "./CategoryFormModal"

// Which modal is open, and for which category.
type ModalState =
  { type: "add" } | { type: "edit"; category: CategoryListItem } | { type: "delete"; category: CategoryListItem } | null

export default function CategoriesView() {
  const { data: currentUser } = useCurrentUser()
  const role = currentUser?.role
  const categoryActions = allowedActions(role, "category", editDeleteActions)

  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<CategorySortBy>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [modal, setModal] = useState<ModalState>(null)

  const debouncedSearch = useDebouncedValue(search.trim())

  const categoriesQuery = { page: currentPage, search: debouncedSearch, sort: getCategoryFilter(sortBy, sortOrder) }
  const { data: categoriesResponse, isLoading, error } = useCategories(categoriesQuery)
  const mutations = useCategoryMutations(categoriesQuery)

  const categories = categoriesResponse?.items ?? []
  const rows = categoriesResponse?.rows ?? 0
  const pageCount = Math.max(1, categoriesResponse?.pageCount ?? 1)
  const closeModal = () => setModal(null)

  function handleSubmitCategory(categoryName: string) {
    if (modal?.type === "edit") {
      mutations.updateCategory.mutate({
        id: modal.category.id,
        type: categoryName,
      })
    } else {
      setCurrentPage(1)
      mutations.addCategory.mutate({ categoryName, optimisticId: -Date.now() })
    }
    closeModal()
  }

  function handleDeleteCategory() {
    if (modal?.type !== "delete") return
    mutations.deleteCategory.mutate(modal.category.id)
    closeModal()
  }

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-2xl bg-background p-4 lg:p-5">
      <ListHeader
        title="Categories"
        count={rows}
        actions={
          can(role, "category:add") && (
            <Button onClick={() => setModal({ type: "add" })} type="button">
              <Plus className="h-4 w-4" />
              Add category
            </Button>
          )
        }
        search={
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            placeholder="Search by type or ID"
          />
        }
        filters={
          <SortPopover
            value={sortBy}
            order={sortOrder}
            options={categorySortOptions}
            onChange={(value, order) => {
              setSortBy(value)
              setSortOrder(order)
              setCurrentPage(1)
            }}
          />
        }
      />

      <div className="mt-5 min-h-0 overflow-auto scrollbar-none">
        <CategoriesTable
          categories={categories}
          isLoading={isLoading}
          error={error}
          actions={categoryActions}
          onEdit={(category) => setModal({ type: "edit", category })}
          onDelete={(category) => setModal({ type: "delete", category })}
        />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-muted-foreground">
          Showing {categories.length} of {rows} categories
        </span>
        <div className="flex">
          <TablePagination currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />
        </div>
      </div>

      {(modal?.type === "add" || modal?.type === "edit") && (
        <CategoryFormModal
          category={modal.type === "edit" ? modal.category : null}
          disabled={mutations.isSubmitting}
          onClose={closeModal}
          onSubmit={handleSubmitCategory}
        />
      )}

      <DeleteConfirmModal
        open={modal?.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDeleteCategory}
        entityName="category"
        subtitle={modal?.type === "delete" ? formatCategoryId(modal.category.id) : ""}
        itemLabel={modal?.type === "delete" ? modal.category.type : null}
        disabled={mutations.isSubmitting}
      />
    </section>
  )
}
