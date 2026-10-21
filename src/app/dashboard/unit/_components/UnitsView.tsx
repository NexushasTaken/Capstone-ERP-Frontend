"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import ListHeader from "@/components/ListHeader"
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
import type { UnitListItem } from "@/types/unit"
import { useUnits, useUnitMutations } from "../_hooks/useUnits"
import { useUnitFilters } from "../_hooks/useUnitFilters"
import { formatUnitId, getUnitFilter, unitSortOptions } from "../_lib/unitHelpers"
import UnitFormModal from "./UnitFormModal"
import UnitsTable from "./UnitsTable"

// Which modal is open, and for which unit.
type ModalState = { type: "add" } | { type: "edit"; unit: UnitListItem } | { type: "delete"; unit: UnitListItem } | null

export default function UnitsView() {
  const { data: currentUser } = useCurrentUser()
  const role = currentUser?.role
  const unitActions = allowedActions(role, "unit", editDeleteActions)

  const { values: filters, update } = useUnitFilters()
  const { sortBy, sortOrder, page: currentPage } = filters
  const [search, setSearch] = useUrlSearch(filters.search, (value) => update({ search: value }))
  const [modal, setModal] = useState<ModalState>(null)

  const [pageSize, setPageSize] = usePageSize("unit")

  const unitsQuery = {
    page: currentPage,
    pageSize,
    search: filters.search,
    sort: getUnitFilter(sortBy, sortOrder),
  }
  const { data: unitsResponse, isLoading, isPlaceholderData, error } = useUnits(unitsQuery)
  const mutations = useUnitMutations(unitsQuery)

  const units = unitsResponse?.items ?? []
  const rows = unitsResponse?.rows ?? 0
  const pageCount = Math.max(1, unitsResponse?.pageCount ?? 1)
  const closeModal = () => setModal(null)

  function handleSubmitUnit(name: string) {
    if (modal?.type === "edit") {
      mutations.updateUnit.mutate({ id: modal.unit.id, name })
    } else {
      update({ page: 1 })
      mutations.addUnit.mutate({ name, optimisticId: -Date.now() })
    }
    closeModal()
  }

  function handleDeleteUnit() {
    if (modal?.type !== "delete") return
    mutations.deleteUnit.mutate(modal.unit.id)
    closeModal()
  }

  return (
    <section className="flex h-dvh w-full flex-col overflow-hidden rounded-2xl bg-background p-4 lg:p-5">
      <ListHeader
        title="Units"
        actions={
          can(role, "unit:add") && (
            <Button onClick={() => setModal({ type: "add" })} type="button">
              <Plus className="h-4 w-4" />
              Add unit
            </Button>
          )
        }
        search={<SearchInput value={search} onChange={setSearch} placeholder="Search by name or ID" />}
        filters={
          <SortPopover
            value={sortBy}
            order={sortOrder}
            options={unitSortOptions}
            onChange={(value, order) => update({ sortBy: value, sortOrder: order })}
          />
        }
      />

      <div className="mt-5 min-h-0 flex-1 overflow-auto scrollbar-x-only">
        <UnitsTable
          units={units}
          isLoading={isLoading || isPlaceholderData}
          error={error}
          actions={unitActions}
          onEdit={(unit) => setModal({ type: "edit", unit })}
          onDelete={(unit) => setModal({ type: "delete", unit })}
        />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {units.length} of {rows} units
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

      {(modal?.type === "add" || modal?.type === "edit") && (
        <UnitFormModal
          unit={modal.type === "edit" ? modal.unit : null}
          disabled={mutations.isSubmitting}
          onClose={closeModal}
          onSubmit={handleSubmitUnit}
        />
      )}

      <DeleteConfirmModal
        open={modal?.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDeleteUnit}
        entityName="unit"
        subtitle={modal?.type === "delete" ? formatUnitId(modal.unit.id) : ""}
        itemLabel={modal?.type === "delete" ? modal.unit.name : null}
        disabled={mutations.isSubmitting}
      />
    </section>
  )
}
