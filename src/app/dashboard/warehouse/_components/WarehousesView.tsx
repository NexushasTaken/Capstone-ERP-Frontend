"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import PageTitle from "@/components/PageTitle"
import SearchInput from "@/components/SearchInput"
import SortPopover from "@/components/SortPopover"
import { TablePagination } from "@/components/TablePagination"
import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { editDeleteActions } from "@/lib/helpers/statusActionHelpers"
import { allowedActions, can } from "@/lib/permissions"
import type { InsertWarehousePayload, WarehouseListItem, WarehouseSortBy } from "@/types/warehouse"
import { useWarehouseMutations, useWarehouses } from "../_hooks/useWarehouses"
import { formatWarehouseId, getWarehouseFilter, warehouseSortOptions } from "../_lib/warehouseHelpers"
import WarehousesTable from "./WarehousesTable"
import WarehouseFormModal from "./WarehouseFormModal"

// Which modal is open, and for which warehouse.
type ModalState =
  | { type: "add" }
  | { type: "edit"; warehouse: WarehouseListItem }
  | { type: "delete"; warehouse: WarehouseListItem }
  | null

export default function WarehousesView() {
  const { data: currentUser } = useCurrentUser()
  const role = currentUser?.role
  const warehouseActions = allowedActions(role, "warehouse", editDeleteActions)

  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<WarehouseSortBy>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [modal, setModal] = useState<ModalState>(null)

  const debouncedSearch = useDebouncedValue(search.trim())

  const warehousesQuery = { page: currentPage, search: debouncedSearch, sort: getWarehouseFilter(sortBy, sortOrder) }
  const { data: warehousesResponse, isLoading, error } = useWarehouses(warehousesQuery)
  const mutations = useWarehouseMutations(warehousesQuery)

  const warehouses = warehousesResponse?.items ?? []
  const rows = warehousesResponse?.rows ?? 0
  const pageCount = Math.max(1, warehousesResponse?.pageCount ?? 1)
  const closeModal = () => setModal(null)

  function handleSubmitWarehouse(values: InsertWarehousePayload) {
    if (modal?.type === "edit") {
      mutations.updateWarehouse.mutate({ id: modal.warehouse.id, ...values })
    } else {
      setCurrentPage(1)
      mutations.addWarehouse.mutate({ ...values, optimisticId: -Date.now() })
    }
    closeModal()
  }

  function handleDeleteWarehouse() {
    if (modal?.type !== "delete") return
    mutations.deleteWarehouse.mutate(modal.warehouse.id)
    closeModal()
  }

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-2xl bg-background p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <PageTitle title="Warehouses" count={rows} />

        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            placeholder="Search by name, address or ID"
          />

          {can(role, "warehouse:add") && (
            <Button onClick={() => setModal({ type: "add" })} type="button">
              <Plus className="h-4 w-4" />
              Add warehouse
            </Button>
          )}
          <SortPopover
            value={sortBy}
            order={sortOrder}
            options={warehouseSortOptions}
            onChange={(value, order) => {
              setSortBy(value)
              setSortOrder(order)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      <div className="mt-5 min-h-0 overflow-auto scrollbar-none">
        <WarehousesTable
          warehouses={warehouses}
          isLoading={isLoading}
          error={error}
          actions={warehouseActions}
          onEdit={(warehouse) => setModal({ type: "edit", warehouse })}
          onDelete={(warehouse) => setModal({ type: "delete", warehouse })}
        />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-muted-foreground">
          Showing {warehouses.length} of {rows} warehouses
        </span>
        <div className="flex">
          <TablePagination currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />
        </div>
      </div>

      {(modal?.type === "add" || modal?.type === "edit") && (
        <WarehouseFormModal
          warehouse={modal.type === "edit" ? modal.warehouse : null}
          disabled={mutations.isSubmitting}
          onClose={closeModal}
          onSubmit={handleSubmitWarehouse}
        />
      )}

      <DeleteConfirmModal
        open={modal?.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDeleteWarehouse}
        entityName="warehouse"
        subtitle={modal?.type === "delete" ? formatWarehouseId(modal.warehouse.id) : ""}
        itemLabel={modal?.type === "delete" ? modal.warehouse.name : null}
        disabled={mutations.isSubmitting}
      />
    </section>
  )
}
