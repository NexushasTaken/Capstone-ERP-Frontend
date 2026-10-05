"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import ExportCsvButton from "@/components/ExportCsvButton"
import PageTitle from "@/components/PageTitle"
import SearchInput from "@/components/SearchInput"
import SortPopover from "@/components/SortPopover"
import { TablePagination } from "@/components/TablePagination"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { exportToCSV } from "@/lib/exportToCsv"
import { formatDate } from "@/lib/format"
import { editDeleteActions } from "@/lib/helpers/statusActionHelpers"
import { allowedActions, can } from "@/lib/permissions"
import type { ProductCategoryFilter, ProductListItem, ProductSortBy } from "@/types/product"
import { useProductMutations, useProducts, type ProductValues } from "../_hooks/useProducts"
import { formatProductId, getProductFilter, productFilters, productSortOptions } from "../_lib/productHelpers"
import ProductDetailsModal from "./ProductDetailsModal"
import ProductFormModal from "./ProductFormModal"
import ProductsTable from "./ProductsTable"

// The selected filter keeps a solid fill; the stock pressed state (bg-muted) is too faint here.
const selectedFilterClass =
  "aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/90"

// Which modal is open, and for which product.
type ModalState =
  | { type: "add" }
  | { type: "edit"; product: ProductListItem }
  | { type: "delete"; product: ProductListItem }
  | { type: "details"; product: ProductListItem }
  | null

export default function ProductsView() {
  const { data: currentUser } = useCurrentUser()
  const role = currentUser?.role
  const productActions = allowedActions(role, "product", editDeleteActions)

  const [search, setSearch] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<ProductCategoryFilter>("Categorized")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<ProductSortBy>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [modal, setModal] = useState<ModalState>(null)
  const debouncedSearch = useDebouncedValue(search)

  const { list, listQueryKey, countByFilter } = useProducts({
    filter: selectedFilter,
    search: debouncedSearch,
    page: currentPage,
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
      setCurrentPage(1)
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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <PageTitle title="Products" count={rows} />

        <div className="flex flex-wrap items-center gap-2">
          {/* Search only applies to categorized products. */}
          {selectedFilter !== "Uncategorized" ? (
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value)
                setCurrentPage(1)
              }}
              placeholder="Search products"
            />
          ) : null}
          <ToggleGroup
            aria-label="Filter products"
            value={[selectedFilter]}
            variant="outline"
            onValueChange={([filter]) => {
              // Clicking the selected filter again would clear it; keep one selected.
              if (!filter) return
              setSelectedFilter(filter as ProductCategoryFilter)
              setCurrentPage(1)
              if (filter === "Uncategorized") setSearch("")
            }}
          >
            {productFilters.map((filter) => (
              <ToggleGroupItem className={selectedFilterClass} key={filter} value={filter}>
                {filter} <span className="ml-1">{countByFilter[filter]}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ExportCsvButton onExport={() => exportProducts(products)} />
          {can(role, "product:add") && (
            <Button onClick={() => setModal({ type: "add" })} type="button">
              <Plus className="h-4 w-4" />
              Add product
            </Button>
          )}
          <SortPopover
            value={sortBy}
            order={sortOrder}
            options={productSortOptions}
            onChange={(value, order) => {
              setSortBy(value)
              setSortOrder(order)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      <div className="mt-5 min-h-0 overflow-auto scrollbar-none flex-1">
        <ProductsTable
          products={products}
          isLoading={list.isLoading}
          error={list.error}
          actions={productActions}
          onShowDetails={(product) => setModal({ type: "details", product })}
          onEdit={(product) => setModal({ type: "edit", product })}
          onDelete={(product) => setModal({ type: "delete", product })}
        />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-muted-foreground">
          Showing {products.length} of {rows} products
        </span>
        <div className="flex">
          <TablePagination currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />
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

function exportProducts(products: ProductListItem[]) {
  exportToCSV(
    products,
    [
      { header: "Product ID", value: (product) => formatProductId(product.id) },
      {
        header: "Category",
        value: (product) => product.categoryName ?? "Uncategorized",
      },
      { header: "Product name", value: (product) => product.name },
      { header: "Price", value: (product) => product.price },
      {
        header: "Created at",
        value: (product) => formatDate(product.created_At),
      },
    ],
    "products",
  )
}
