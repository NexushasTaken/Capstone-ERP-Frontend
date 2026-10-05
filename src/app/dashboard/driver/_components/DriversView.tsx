'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'
import PageTitle from '@/components/PageTitle'
import SearchInput from '@/components/SearchInput'
import SortPopover from '@/components/SortPopover'
import { TablePagination } from '@/components/TablePagination'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { allowedActions, can } from '@/lib/permissions'
import type { DriverListItem, DriverSortBy } from '@/types/driver'
import { useDriverMutations, useDrivers } from '../_hooks/useDrivers'
import {
  DRIVER_ITEMS_PER_PAGE,
  driverActionOptions,
  driverSortOptions,
  formatDriverId,
  getDriverFilter,
  getDriverFullName,
} from '../_lib/driverHelpers'
import DriverFormModal from './DriverFormModal'
import DriversTable from './DriversTable'

// Which modal is open, and for which driver.
type ModalState =
  { type: 'add' } | { type: 'update'; driver: DriverListItem } | { type: 'delete'; driver: DriverListItem } | null

export default function DriversView() {
  const { data: currentUser } = useCurrentUser()
  const role = currentUser?.role
  const driverActions = allowedActions(role, 'driver', driverActionOptions)

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<DriverSortBy>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [modal, setModal] = useState<ModalState>(null)
  const debouncedSearch = useDebouncedValue(search.trim())

  const { data, isLoading, isFetching, error } = useDrivers({
    page: currentPage,
    pageSize: DRIVER_ITEMS_PER_PAGE,
    name: debouncedSearch || undefined,
    filter: getDriverFilter({ value: sortBy, order: sortOrder, label: '' }),
  })
  const mutations = useDriverMutations()

  const drivers = data?.items ?? []
  const rows = data?.rows ?? 0
  const pageCount = Math.max(1, data?.pageCount ?? 1)
  const closeModal = () => setModal(null)

  function handleSubmitDriver(values: { firstName: string; lastName: string }) {
    if (modal?.type === 'update') {
      mutations.updateDriver.mutate({ id: modal.driver.id, ...values })
    } else {
      mutations.addDriver.mutate(values)
      setCurrentPage(1)
    }
    closeModal()
  }

  function handleDeleteDriver() {
    if (modal?.type !== 'delete') return
    mutations.deleteDriver.mutate(modal.driver.id)
    closeModal()
  }

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-2xl bg-background p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <PageTitle title="Drivers" count={rows} />

        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            placeholder="Search drivers"
          />

          {can(role, 'driver:add') && (
            <Button onClick={() => setModal({ type: 'add' })} type="button">
              <Plus className="h-4 w-4" />
              Add driver
            </Button>
          )}
          <SortPopover
            value={sortBy}
            order={sortOrder}
            options={driverSortOptions}
            onChange={(value, order) => {
              setSortBy(value)
              setSortOrder(order)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      <div className="mt-5 min-h-0 overflow-auto scrollbar-none">
        <DriversTable
          drivers={drivers}
          isLoading={isLoading}
          error={error}
          actions={driverActions}
          onUpdate={(driver) => setModal({ type: 'update', driver })}
          onDelete={(driver) => setModal({ type: 'delete', driver })}
        />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-muted-foreground">
          Showing {drivers.length} of {rows} drivers
          {isFetching ? ' - Updating...' : ''}
        </span>
        <div className="flex">
          <TablePagination currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />
        </div>
      </div>

      {(modal?.type === 'add' || modal?.type === 'update') && (
        <DriverFormModal
          driver={modal.type === 'update' ? modal.driver : null}
          disabled={mutations.isSubmitting}
          onClose={closeModal}
          onSubmit={handleSubmitDriver}
        />
      )}

      <DeleteConfirmModal
        open={modal?.type === 'delete'}
        onClose={closeModal}
        onConfirm={handleDeleteDriver}
        entityName="driver"
        subtitle={modal?.type === 'delete' ? formatDriverId(modal.driver.id) : ''}
        itemLabel={modal?.type === 'delete' ? getDriverFullName(modal.driver) : ''}
        disabled={mutations.isSubmitting}
      />
    </section>
  )
}
