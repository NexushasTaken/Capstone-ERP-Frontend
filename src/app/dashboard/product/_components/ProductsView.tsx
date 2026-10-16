"use client"

import { useState } from "react"
import { Plus, Upload } from "lucide-react"
import CountFilterSelect from "@/components/CountFilterSelect"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import ImportModal from "@/components/ImportModal"
import ListHeader from "@/components/ListHeader"
import ListSummary from "@/components/ListSummary"
import { formatCount } from "@/lib/format"
import SearchInput from "@/components/SearchInput"
import SortPopover from "@/components/SortPopover"
import PageSizeSelect from "@/components/PageSizeSelect"
import { TablePagination } from "@/components/TablePagination"
import { Button } from "@/components/ui/button"
import { usePageSize } from "@/hooks/usePageSize"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useUrlSearch } from "@/hooks/useUrlSearch"
import { editDeleteActions } from "@/lib/helpers/statusActionHelpers"
import { allowedActions, can } from "@/lib/permissions"
import type { ProductCategoryFilter, ProductListItem } from "@/types/product"
import { useProductFilters } from "../_hooks/useProductFilters"
import { useProductMutations, useProducts, type ProductValues } from "../_hooks/useProducts"
import { formatProductId } from "@/lib/helpers/productHelpers"
import { getProductFilter, productFilters, productSortOptions } from "../_lib/productHelpers"
import { checkProductCells, productImportColumns, productImportHint, productImportSchema } from "../_lib/productImport"
import ProductDetailsModal from "./ProductDetailsModal"
import ProductFormModal from "./ProductFormModal"
import ProductsTable from "./ProductsTable"

// Which modal is open, and for which product.
type ModalState =
  | { type: "add" }
  | { type: "import" }
  | { type: "edit"; product: ProductListItem }
  | { type: "delete"; product: ProductListItem }
  | { type: "details"; product: ProductListItem }
  | null

export default function ProductsView() {
  const { data: currentUser } = useCurrentUser()
  const role = currentUser?.role
  const productActions = allowedActions(role, "product", editDeleteActions)

  const { values: filters, update } = useProductFilters()
  const { filter: selectedFilter, sortBy, sortOrder, page: currentPage } = filters
  const [search, setSearch] = useUrlSearch(filters.search, (value) => update({ search: value }))
  const [modal, setModal] = useState<ModalState>(null)
  const [pageSize, setPageSize] = usePageSize("product")

  const { list, listQueryKey, countByFilter } = useProducts({
    filter: selectedFilter,
    search: filters.search,
    page: currentPage,
    pageSize,
    sort: getProductFilter(sortBy, sortOrder),
  })
  const mutations = useProductMutations(listQueryKey, selectedFilter)

  const products = list.data?.items ?? []
  const rows = list.data?.rows ?? 0
  const pageCount = Math.max(1, list.data?.pageCount ?? 1)
  const closeModal = () => setModal(null)

  function handleSubmitProduct(values: ProductValues) {
    if (modal?.type === "edit") {
      mutations.updateProduct.mutate({ id: modal.product.id, ...values })
    } else {
      update({ page: 1 })
      mutations.addProduct.mutate({ ...values, optimisticId: -Date.now() })
    }
    closeModal()
  }

  function handleDeleteProduct() {
    if (modal?.type !== "delete") return
    mutations.deleteProduct.mutate(modal.product.id)
    closeModal()
  }

  return (
    <section className="flex h-dvh w-full flex-col overflow-hidden rounded-2xl bg-background p-4 lg:p-5">
      <ListHeader
        title="Products"
        actions={
          <>
            {can(role, "product:add") && (
              <>
                <Button onClick={() => setModal({ type: "import" })} type="button" variant="outline">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button onClick={() => setModal({ type: "add" })} type="button">
                  <Plus className="h-4 w-4" />
                  Add product
                </Button>
              </>
            )}
          </>
        }
        // Search only applies to categorized products.
        search={
          selectedFilter !== "Uncategorized" ? (
            <SearchInput value={search} onChange={setSearch} placeholder="Search by name, category or ID" />
          ) : null
        }
        filters={
          <>
            <CountFilterSelect
              aria-label="Filter products"
              options={productFilters.map((filter) => ({
                value: filter,
                label: filter,
                count: countByFilter[filter],
              }))}
              value={selectedFilter}
              onChange={(filter) =>
                update(
                  filter === "Uncategorized"
                    ? { filter: filter as ProductCategoryFilter, search: "" }
                    : { filter: filter as ProductCategoryFilter },
                )
              }
            />
            <SortPopover
              value={sortBy}
              order={sortOrder}
              options={productSortOptions}
              onChange={(value, order) => update({ sortBy: value, sortOrder: order })}
            />
          </>
        }
      />

      <ListSummary>
        {formatCount(rows, "product")}
        {selectedFilter === "Categorized" && countByFilter.Uncategorized > 0 && (
          <>, plus {countByFilter.Uncategorized.toLocaleString("en-PH")} without a category</>
        )}
      </ListSummary>

      <div className="mt-5 min-h-0 flex-1 overflow-auto scrollbar-x-only">
        <ProductsTable
          products={products}
          isLoading={list.isLoading || list.isPlaceholderData}
          error={list.error}
          actions={productActions}
          onShowDetails={(product) => setModal({ type: "details", product })}
          onEdit={(product) => setModal({ type: "edit", product })}
          onDelete={(product) => setModal({ type: "delete", product })}
        />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {products.length} of {rows} products
          </span>
          <PageSizeSelect
            value={pageSize}
            onChange={(size) => {
              setPageSize(size)
              update({ page: 1 })
            }}
          />
        </div>
        <div className="flex">
          <TablePagination currentPage={currentPage} totalPages={pageCount} onPageChange={(page) => update({ page })} />
        </div>
      </div>

      <ProductDetailsModal product={modal?.type === "details" ? modal.product : null} onClose={closeModal} />

      {(modal?.type === "add" || modal?.type === "edit") && (
        <ProductFormModal
          product={modal.type === "edit" ? modal.product : null}
          disabled={mutations.isSubmitting}
          onClose={closeModal}
          onSubmit={handleSubmitProduct}
        />
      )}

      {modal?.type === "import" && (
        <ImportModal
          title="Import products"
          columns={productImportColumns}
          schema={productImportSchema}
          templateName="products-template.csv"
          hint={productImportHint}
          pending={mutations.importProducts.isPending}
          onCheck={checkProductCells}
          onImport={(rows) => mutations.importProducts.mutateAsync(rows)}
          onClose={closeModal}
        />
      )}

      <DeleteConfirmModal
        open={modal?.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDeleteProduct}
        entityName="product"
        subtitle={modal?.type === "delete" ? formatProductId(modal.product.id) : ""}
        itemLabel={modal?.type === "delete" ? modal.product.name : null}
        disabled={mutations.isSubmitting}
      />
    </section>
  )
}
