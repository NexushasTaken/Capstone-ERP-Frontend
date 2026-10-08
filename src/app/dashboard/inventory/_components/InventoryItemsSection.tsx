"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Plus, X } from "lucide-react"
import CountFilterSelect from "@/components/CountFilterSelect"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import ExportCsvButton from "@/components/ExportCsvButton"
import ListHeader from "@/components/ListHeader"
import SearchInput from "@/components/SearchInput"
import SortPopover from "@/components/SortPopover"
import PageSizeSelect from "@/components/PageSizeSelect"
import { TablePagination } from "@/components/TablePagination"
import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { usePageSize } from "@/hooks/usePageSize"
import { exportToCSV } from "@/lib/exportToCsv"
import { formatInventoryId, getInventoryFilter, inventorySortOptions, titleCase } from "@/lib/helpers/inventoryHelpers"
import { editDeleteActions } from "@/lib/helpers/statusActionHelpers"
import { allowedActions, can } from "@/lib/permissions"
import { queryKeys } from "@/lib/query/queryKeys"
import type { InventoryListItem } from "@/types/inventory"
import {
  useInventories,
  useInventoryMutations,
  useInventoryStatusCounts,
  useSelectableCategories,
  useSelectableWarehouses,
} from "../_hooks/useInventory"
import { useInventoryFilters } from "../_hooks/useInventoryFilters"
import InventoryDetailsModal from "./InventoryDetailsModal"
import InventoryFormModal, { type InventoryFormValues } from "./InventoryFormModal"
import InventoryTable from "./InventoryTable"
import MarkDamageModal from "./MarkDamageModal"
import QuantityRangeFilter from "./QuantityRangeFilter"
import RestockModal from "./RestockModal"

const inventoryStatusIds: Record<string, number> = {
  All: 0,
  available: 1,
  "low stock": 2,
  critical: 3,
}

// Which modal is open, and for which item. Adding has its own flag so its draft survives closing.
type ModalState = {
  type: "edit" | "delete" | "details" | "damage" | "restock"
  item: InventoryListItem
} | null

export default function InventoryItemsSection() {
  const { data: currentUser } = useCurrentUser()
  const role = currentUser?.role
  const inventoryActions = allowedActions(role, "inventory", [
    ...editDeleteActions,
    { label: "Restock", value: "restock", icon: Plus },
    {
      label: "Mark as damage",
      value: "damage",
      icon: AlertTriangle,
      variant: "destructive" as const,
    },
  ])

  const { filters, update, hasFilters, clearFilters } = useInventoryFilters()
  const { search: urlSearch, status: selectedFilter, page: currentPage, sortBy, sortOrder } = filters
  // The box updates per keystroke; the URL (and so the request) follows once typing pauses.
  const [search, setSearch] = useState(urlSearch)
  const [syncedUrlSearch, setSyncedUrlSearch] = useState(urlSearch)
  if (syncedUrlSearch !== urlSearch) {
    setSyncedUrlSearch(urlSearch)
    setSearch(urlSearch)
  }
  const [pageSize, setPageSize] = usePageSize("inventory")
  const [modal, setModal] = useState<ModalState>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  // Bumped after a successful add to clear the add form.
  const [addFormKey, setAddFormKey] = useState(0)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search.trim() !== urlSearch) update({ search: search.trim() })
    }, 400)
    return () => clearTimeout(timeout)
  }, [search, urlSearch, update])
  const warehouses = useSelectableWarehouses(true).warehouses
  const categories = useSelectableCategories()

  const listParams = {
    page: currentPage,
    pageSize,
    name: urlSearch || undefined,
    statusId: inventoryStatusIds[selectedFilter] ?? 0,
    filter: getInventoryFilter({ value: sortBy, order: sortOrder }),
    warehouseId: Number(filters.warehouse) || undefined,
    categoryId: Number(filters.category) || undefined,
    minQuantity: filters.minQuantity === "" ? undefined : Number(filters.minQuantity),
    maxQuantity: filters.maxQuantity === "" ? undefined : Number(filters.maxQuantity),
  }
  const { data: inventoriesResponse, isLoading, error } = useInventories(listParams)
  const { data: statusCounts, isError: statusCountsError } = useInventoryStatusCounts()
  const mutations = useInventoryMutations(queryKeys.inventories.all(listParams))

  const inventories = inventoriesResponse?.items ?? []
  const rows = inventoriesResponse?.rows ?? 0
  const totalPages = Math.max(1, inventoriesResponse?.pageCount ?? 1)
  const countsAvailable = !!statusCounts && !statusCountsError
  const statusFilters = [
    {
      label: "All",
      count: statusCounts?.reduce((total, item) => total + item.count, 0) ?? 0,
    },
    ...(statusCounts ?? []).map((item) => ({
      label: item.status,
      count: item.count,
    })),
  ]
  const selectedFilterCount = statusFilters.find((filter) => filter.label === selectedFilter)?.count ?? 0
  // Show the latest copy of the selected item (e.g. after a restock) rather than the one clicked.
  const modalItem = modal ? (inventories.find((item) => item.id === modal.item.id) ?? modal.item) : null
  const closeModal = () => setModal(null)

  function handleAction(action: string, item: InventoryListItem) {
    if (mutations.isSubmitting) return
    if ((action === "damage" || action === "restock") && item.id <= 0) return
    if (action === "edit" || action === "delete" || action === "damage" || action === "restock") {
      setModal({ type: action, item })
    }
  }

  function handleAddInventory(values: InventoryFormValues) {
    setIsAddModalOpen(false)
    mutations.addInventory.mutate(
      { ...values, optimisticId: -Date.now() },
      { onSuccess: () => setAddFormKey((key) => key + 1) },
    )
  }

  function handleUpdateInventory(values: InventoryFormValues) {
    if (modal?.type !== "edit") return
    mutations.updateInventory.mutate({ id: modal.item.id, reorderPoint: values.reorderPoint })
    closeModal()
  }

  function handleDeleteInventory() {
    if (modal?.type !== "delete") return
    mutations.deleteInventory.mutate(modal.item.id)
    closeModal()
  }

  return (
    <section
      id="RawMaterials"
      className="relative flex w-full scroll-mt-6 flex-col rounded-2xl p-4 shadow-sm lg:p-5 border border-border"
    >
      <span id="Risks" className="absolute -top-6" aria-hidden="true" />
      <ListHeader
        as="h2"
        title="Inventory items"
        count={countsAvailable ? selectedFilterCount.toLocaleString() : "-"}
        actions={
          <>
            <ExportCsvButton onExport={() => exportInventory(inventories)} />
            {can(role, "inventory:add") && (
              <Button onClick={() => setIsAddModalOpen(true)} type="button">
                <Plus className="h-4 w-4" />
                Add inventory
              </Button>
            )}
          </>
        }
        search={
          <SearchInput value={search} onChange={setSearch} placeholder="Search by product, warehouse, status or ID" />
        }
        filters={
          <>
            <CountFilterSelect
              aria-label="Filter inventory by status"
              options={statusFilters.map((filter) => ({
                value: filter.label,
                label: titleCase(filter.label),
                count: countsAvailable ? filter.count : undefined,
              }))}
              value={selectedFilter}
              onChange={(status) => update({ status })}
            />
            <CountFilterSelect
              aria-label="Filter inventory by warehouse"
              options={[
                { value: "", label: "All Warehouses" },
                ...warehouses.map((warehouse) => ({
                  value: String(warehouse.id),
                  label: titleCase(warehouse.name),
                  count: warehouse.stocks,
                })),
              ]}
              value={filters.warehouse}
              onChange={(warehouse) => update({ warehouse })}
            />
            <CountFilterSelect
              aria-label="Filter inventory by category"
              options={[
                { value: "", label: "All Categories" },
                ...categories.map((category) => ({ value: String(category.id), label: titleCase(category.type) })),
              ]}
              value={filters.category}
              onChange={(category) => update({ category })}
            />
            <QuantityRangeFilter
              min={filters.minQuantity}
              max={filters.maxQuantity}
              onChange={({ min, max }) => update({ minQuantity: min, maxQuantity: max })}
            />
            <SortPopover
              value={sortBy}
              order={sortOrder}
              options={inventorySortOptions}
              onChange={(value, order) => update({ sortBy: value, sortOrder: order })}
            />
            {hasFilters && (
              <Button className="text-muted-foreground" onClick={clearFilters} type="button" variant="ghost">
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </>
        }
      />

      {/* Capped so a long page scrolls inside the widget, keeping the header and horizontal scrollbar in view. */}
      <div className="mt-5 max-h-[75dvh] min-h-0 overflow-auto scrollbar-x-only">
        <InventoryTable
          items={inventories}
          isLoading={isLoading}
          error={error}
          actions={inventoryActions}
          onShowDetails={(item) => setModal({ type: "details", item })}
          onAction={handleAction}
        />
      </div>

      <div className="mt-4 flex flex-col lg:flex-row gap-4 lg:gap-0 w-full justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {inventories.length} of {rows} inventory items
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
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => update({ page })}
          />
        </div>
      </div>

      <InventoryFormModal
        key={addFormKey}
        open={isAddModalOpen}
        item={null}
        disabled={mutations.isSubmitting}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddInventory}
      />

      {modal?.type === "edit" && (
        <InventoryFormModal
          open
          item={modal.item}
          disabled={mutations.isSubmitting}
          onClose={closeModal}
          onSubmit={handleUpdateInventory}
        />
      )}

      <DeleteConfirmModal
        open={modal?.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDeleteInventory}
        entityName="inventory"
        subtitle={modal?.type === "delete" ? formatInventoryId(String(modal.item.id)) : ""}
        itemLabel={modal?.type === "delete" ? modal.item.name : null}
        disabled={mutations.isSubmitting}
      />

      {modal?.type === "damage" && modalItem && (
        <MarkDamageModal
          item={modalItem}
          isPending={mutations.markAsDamage.isPending}
          onClose={closeModal}
          onSubmit={(payload) => {
            closeModal()
            mutations.markAsDamage.mutate(payload)
          }}
        />
      )}

      {modal?.type === "restock" && modalItem && (
        <RestockModal
          item={modalItem}
          isPending={mutations.restock.isPending}
          onClose={closeModal}
          onSubmit={(payload) => mutations.restock.mutate(payload, { onSuccess: closeModal })}
        />
      )}

      <InventoryDetailsModal item={modal?.type === "details" ? modalItem : null} onClose={closeModal} />
    </section>
  )
}

function exportInventory(items: InventoryListItem[]) {
  exportToCSV(
    items,
    [
      {
        header: "Inventory ID",
        value: (item) => formatInventoryId(String(item.id)),
      },
      { header: "Product", value: (item) => item.name },
      { header: "Available", value: (item) => item.quantity },
      { header: "Reorder point", value: (item) => item.reorderPoint },
      { header: "Category", value: (item) => item.categoryName },
      { header: "Warehouse", value: (item) => item.warehouseName },
      { header: "Status", value: (item) => item.status },
    ],
    "inventory",
  )
}
