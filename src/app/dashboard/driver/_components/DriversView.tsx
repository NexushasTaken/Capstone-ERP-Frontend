"use client"

import { useState } from "react"
import { Plus, Upload } from "lucide-react"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import ImportModal from "@/components/ImportModal"
import ListHeader from "@/components/ListHeader"
import SearchInput from "@/components/SearchInput"
import SortPopover from "@/components/SortPopover"
import PageSizeSelect from "@/components/PageSizeSelect"
import { TablePagination } from "@/components/TablePagination"
import { Button } from "@/components/ui/button"
import { usePageSize } from "@/hooks/usePageSize"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useUrlSearch } from "@/hooks/useUrlSearch"
import { allowedActions, can } from "@/lib/permissions"
import type { DriverListItem } from "@/types/driver"
import { useDriverMutations, useDrivers } from "../_hooks/useDrivers"
import { useDriverFilters } from "../_hooks/useDriverFilters"
import {
  driverActionOptions,
  driverSortOptions,
  formatDriverId,
  getDriverFilter,
  getDriverFullName,
} from "../_lib/driverHelpers"
import { driverImportColumns, driverImportSchema } from "../_lib/driverImport"
import DriverFormModal from "./DriverFormModal"
import DriversTable from "./DriversTable"

// Which modal is open, and for which driver.
type ModalState =
  | { type: "add" }
  | { type: "import" }
  | { type: "update"; driver: DriverListItem }
  | { type: "delete"; driver: DriverListItem }
  | null

export default function DriversView() {
  const { data: currentUser } = useCurrentUser()
  const role = currentUser?.role
  const driverActions = allowedActions(role, "driver", driverActionOptions)

  const { values: filters, update } = useDriverFilters()
  const { sortBy, sortOrder, page: currentPage } = filters
  const [search, setSearch] = useUrlSearch(filters.search, (value) => update({ search: value }))
  const [modal, setModal] = useState<ModalState>(null)
  const [pageSize, setPageSize] = usePageSize("driver")

  const { data, isLoading, isPlaceholderData, isFetching, error } = useDrivers({
    page: currentPage,
    pageSize,
    name: filters.search || undefined,
    filter: getDriverFilter({ value: sortBy, order: sortOrder, label: "" }),
  })
  const mutations = useDriverMutations()

  const drivers = data?.items ?? []
  const rows = data?.rows ?? 0
  const pageCount = Math.max(1, data?.pageCount ?? 1)
  const closeModal = () => setModal(null)

  function handleSubmitDriver(values: { firstName: string; lastName: string }) {
    if (modal?.type === "update") {
      mutations.updateDriver.mutate({ id: modal.driver.id, ...values })
    } else {
      mutations.addDriver.mutate(values)
      update({ page: 1 })
    }
    closeModal()
  }

  function handleDeleteDriver() {
    if (modal?.type !== "delete") return
    mutations.deleteDriver.mutate(modal.driver.id)
    closeModal()
  }

  return (
    <section className="flex h-dvh w-full flex-col overflow-hidden rounded-2xl bg-background p-4 lg:p-5">
      <ListHeader
        title="Drivers"
        actions={
          can(role, "driver:add") && (
            <>
              <Button onClick={() => setModal({ type: "import" })} type="button" variant="outline">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button onClick={() => setModal({ type: "add" })} type="button">
                <Plus className="h-4 w-4" />
                Add driver
              </Button>
            </>
          )
        }
        search={<SearchInput value={search} onChange={setSearch} placeholder="Search by name or ID" />}
        filters={
          <SortPopover
            value={sortBy}
            order={sortOrder}
            options={driverSortOptions}
            onChange={(value, order) => update({ sortBy: value, sortOrder: order })}
          />
        }
      />

      <div className="mt-5 min-h-0 flex-1 overflow-auto scrollbar-x-only">
        <DriversTable
          drivers={drivers}
          isLoading={isLoading || isPlaceholderData}
          error={error}
          actions={driverActions}
          onUpdate={(driver) => setModal({ type: "update", driver })}
          onDelete={(driver) => setModal({ type: "delete", driver })}
        />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {drivers.length} of {rows} drivers
          </span>
          <PageSizeSelect
            value={pageSize}
            onChange={(size) => {
              setPageSize(size)
              update({ page: 1 })
            }}
          />
          {isFetching && <span className="text-sm text-muted-foreground">Updating...</span>}
        </div>
        <div className="flex">
          <TablePagination currentPage={currentPage} totalPages={pageCount} onPageChange={(page) => update({ page })} />
        </div>
      </div>

      {(modal?.type === "add" || modal?.type === "update") && (
        <DriverFormModal
          driver={modal.type === "update" ? modal.driver : null}
          disabled={mutations.isSubmitting}
          onClose={closeModal}
          onSubmit={handleSubmitDriver}
        />
      )}

      {modal?.type === "import" && (
        <ImportModal
          title="Import drivers"
          columns={driverImportColumns}
          schema={driverImportSchema}
          templateName="drivers-template.csv"
          pending={mutations.importDrivers.isPending}
          onImport={(rows) => mutations.importDrivers.mutateAsync(rows)}
          onClose={closeModal}
        />
      )}

      <DeleteConfirmModal
        open={modal?.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDeleteDriver}
        entityName="driver"
        subtitle={modal?.type === "delete" ? formatDriverId(modal.driver.id) : ""}
        itemLabel={modal?.type === "delete" ? getDriverFullName(modal.driver) : ""}
        disabled={mutations.isSubmitting}
      />
    </section>
  )
}
