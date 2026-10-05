"use client"

import { useState } from "react"
import { AlertTriangle, Plus } from "lucide-react"
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
import { capitalize, formatInventoryId, getInventoryFilter, inventorySortOptions } from "@/lib/helpers/inventoryHelpers"
import { editDeleteActions } from "@/lib/helpers/statusActionHelpers"
import { allowedActions, can } from "@/lib/permissions"
import { queryKeys } from "@/lib/query/queryKeys"
import type { InventoryFilter, InventoryListItem, InventorySortBy } from "@/types/inventory"
import { useInventories, useInventoryMutations, useInventoryStatusCounts } from "../_hooks/useInventory"
import InventoryDetailsModal from "./InventoryDetailsModal"
import InventoryFormModal, { type InventoryFormValues } from "./InventoryFormModal"
import InventoryTable from "./InventoryTable"
import MarkDamageModal from "./MarkDamageModal"
import RestockModal from "./RestockModal"

// The selected filter keeps a solid fill; the stock pressed state (bg-muted) is too faint here.
const selectedFilterClass =
  "aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/90"

const ITEMS_PER_PAGE = 10

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

  const [search, setSearch] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<InventoryFilter>("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<InventorySortBy>("latest")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [modal, setModal] = useState<ModalState>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  // Bumped after a successful add to clear the add form.
  const [addFormKey, setAddFormKey] = useState(0)
  const debouncedSearch = useDebouncedValue(search.trim())

  const listParams = {
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    name: debouncedSearch || undefined,
    statusId: inventoryStatusIds[selectedFilter] ?? 0,
    filter: getInventoryFilter({ value: sortBy, order: sortOrder }),
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
    mutations.updateInventory.mutate({
      id: modal.item.id,
      name: values.name,
      productId: values.productId,
      warehouseId: values.warehouseId,
      warehouseName: values.warehouseName,
      reorderPoint: values.reorderPoint,
    })
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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <PageTitle
          as="h2"
          title="Inventory items"
          count={countsAvailable ? selectedFilterCount.toLocaleString() : "-"}
        />

        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            placeholder="Search inventory"
          />

          <ExportCsvButton onExport={() => exportInventory(inventories)} />

          <ToggleGroup
            aria-label="Filter inventory by status"
            value={[selectedFilter]}
            variant="outline"
            onValueChange={([filter]) => {
              // Clicking the selected filter again would clear it; keep one selected.
              if (!filter) return
              setSelectedFilter(filter as InventoryFilter)
              setCurrentPage(1)
            }}
          >
            {statusFilters.map((filter) => (
              <ToggleGroupItem className={selectedFilterClass} key={filter.label} value={filter.label}>
                {filter.label === "All" ? "All" : capitalize(filter.label)}
                <span className="ml-1">{countsAvailable ? filter.count.toLocaleString() : "-"}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <SortPopover
            value={sortBy}
            order={sortOrder}
            options={inventorySortOptions}
            onChange={(value, order) => {
              setSortBy(value)
              setSortOrder(order)
              setCurrentPage(1)
            }}
          />

          {can(role, "inventory:add") && (
            <Button onClick={() => setIsAddModalOpen(true)} type="button">
              <Plus className="h-4 w-4" />
              Add inventory
            </Button>
          )}
        </div>
      </div>

      <div className="mt-5 min-h-0 overflow-auto">
        <InventoryTable
          items={inventories}
          isLoading={isLoading}
          error={error}
          actions={inventoryActions}
          onShowDetails={(item) => setModal({ type: "details", item })}
          onAction={handleAction}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 w-full justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Showing {inventories.length} of {rows} inventory items
        </span>
        <div className="flex">
          <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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
      { header: "Warehouse", value: (item) => item.warehouseName },
      { header: "Status", value: (item) => item.status },
      { header: "Date arrived", value: (item) => formatDate(item.dateArrived) },
    ],
    "inventory",
  )
}
