'use client'

import { Search, X, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import CloseButton from '@/app/components/CloseButton'
import AppModal from '@/app/components/modals/AppModal'
import { PaginationDemo } from '@/app/components/Pagination'
import SortPopover from '@/app/components/SortPopover'
import StatusAction from '@/app/components/StatusAction'
import Loading from '@/app/components/loaders/Loading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DriverListItem, DriverSortBy } from '@/app/types/driver'
import { deleteDriver, fetchDrivers, insertDriver, updateDriver } from '@/app/services/driverApi'
import {
  DRIVER_ITEMS_PER_PAGE,
  driverActionOptions,
  driverSortOptions,
  driverTableColumns,
  formatDriverDate,
  formatDriverId,
  getDriverFilter,
  getDriverFullName,
} from '@/app/utils/helpers/driverHelper'
import { queryKeys } from '@/app/utils/query/queryKeys'
import { invalidateDrivers } from '@/app/utils/query/queryInvalidation'

export default function DriverForm() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<DriverSortBy>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<DriverListItem | null>(null)
  const [form, setForm] = useState({ firstName: '', lastName: '' })
  const queryClient = useQueryClient()
  const selectedSortOption = { value: sortBy, order: sortOrder, label: '' }
  const queryParams = {
    page: currentPage,
    pageSize: DRIVER_ITEMS_PER_PAGE,
    name: debouncedSearch || undefined,
    filter: getDriverFilter(selectedSortOption),
  }
  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: queryKeys.drivers.all(queryParams),
    queryFn: ({ signal }) => fetchDrivers(queryParams, signal),
    keepPreviousData: true,
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setCurrentPage(1)
    }, 400)

    return () => clearTimeout(timeout)
  }, [search])

  const drivers = data?.items ?? []
  const rows = data?.rows ?? 0
  const pageCount = Math.max(1, data?.pageCount ?? 1)
  const addDriverMutation = useMutation({
    mutationFn: insertDriver,
    onSuccess: () => {
      toast.success('Driver added successfully')
      invalidateDrivers(queryClient)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add driver')
    },
  })
  const updateDriverMutation = useMutation({
    mutationFn: updateDriver,
    onSuccess: () => {
      toast.success('Driver updated successfully')
      invalidateDrivers(queryClient)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update driver')
    },
  })
  const deleteDriverMutation = useMutation({
    mutationFn: deleteDriver,
    onSuccess: () => {
      toast.success('Driver deleted successfully')
      invalidateDrivers(queryClient)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete driver')
    },
  })
  const isSubmitting =
    addDriverMutation.isLoading ||
    updateDriverMutation.isLoading ||
    deleteDriverMutation.isLoading
  const formCanSubmit = form.firstName.trim() !== '' && form.lastName.trim() !== ''

  function resetForm() {
    setForm({ firstName: '', lastName: '' })
    setSelectedDriver(null)
  }

  function updateFormField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleAddDriver() {
    if (!formCanSubmit) return

    addDriverMutation.mutate({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
    })
    setIsAddModalOpen(false)
    resetForm()
    setCurrentPage(1)
  }

  function handleUpdateDriver() {
    if (!formCanSubmit || !selectedDriver) return

    updateDriverMutation.mutate({
      id: selectedDriver.id,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
    })
    setIsUpdateModalOpen(false)
    resetForm()
  }

  function handleDeleteDriver() {
    if (!selectedDriver) return

    deleteDriverMutation.mutate(selectedDriver.id)
    setIsDeleteModalOpen(false)
    resetForm()
  }

  function openUpdateModal(driver: DriverListItem) {
    setSelectedDriver(driver)
    setForm({
      firstName: driver.firstName,
      lastName: driver.lastName,
    })
    setIsUpdateModalOpen(true)
  }

  function openDeleteModal(driver: DriverListItem) {
    setSelectedDriver(driver)
    setIsDeleteModalOpen(true)
  }

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-2xl bg-white p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-[#121514]">Drivers</h1>
          <span className="rounded-md border border-[#DFE2E0] px-3 py-1 text-sm text-[#121514]">
            {rows}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search drivers"
              className="w-full rounded-xl border border-[#DFE2E0] bg-white px-3 py-2 text-sm text-[#121514] placeholder:text-[#737A76] focus:border-[#121514] focus:outline-none focus:ring-1 focus:ring-[#121514]"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
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
            Add driver
          </Button>
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
        <table className="w-full min-w-150 border-separate border-spacing-y-2 text-left">
          <thead className="text-sm font-normal text-[#737A76]">
            <tr>
              {driverTableColumns.map((column) => (
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
                <td colSpan={driverTableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
                  <Loading />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={driverTableColumns.length} className="px-3 py-4 text-center text-sm text-red-500">
                  {error instanceof Error ? error.message : 'Failed to load drivers'}
                </td>
              </tr>
            ) : drivers.length === 0 ? (
              <tr>
                <td colSpan={driverTableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
                  No drivers found.
                </td>
              </tr>
            ) : (
              drivers.map((driver) => (
                <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={driver.id}>
                  <td className="rounded-l-xl px-3 py-5 font-medium whitespace-nowrap">{formatDriverId(driver.id)}</td>
                  <td className="px-3 py-5 font-medium whitespace-nowrap capitalize">{driver.firstName}</td>
                  <td className="px-3 py-5 font-medium whitespace-nowrap capitalize">{driver.lastName}</td>
                  <td className="px-3 py-5 whitespace-nowrap">{formatDriverDate(driver.created_At)}</td>
                  <td className="rounded-r-xl px-3 py-5">
                    <div className="flex items-center justify-end">
                      <StatusAction
                        actions={driverActionOptions}
                        label={`More actions for driver ${driver.id}`}
                        onAction={(action) => {
                          if (action === 'update') openUpdateModal(driver)
                          if (action === 'delete') openDeleteModal(driver)
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
          Showing {drivers.length} of {rows} drivers
          {isFetching ? ' - Updating...' : ''}
        </span>
        <div className="flex">
          <PaginationDemo currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />
        </div>
      </div>

      <AppModal
        className="flex max-h-fit flex-col lg:max-w-lg"
        onClose={() => {
          setIsAddModalOpen(false)
          resetForm()
        }}
        open={isAddModalOpen}
      >
        <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#737A76]">New driver</span>
            <span className="text-xl font-medium text-[#0c0d0d]">Add driver</span>
          </div>
          <CloseButton
            onClick={() => {
              setIsAddModalOpen(false)
              resetForm()
            }}
          />
        </div>

        <DriverFields form={form} onChange={updateFormField} />

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
            onClick={handleAddDriver}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add driver
          </Button>
        </div>
      </AppModal>

      <AppModal
        className="flex max-h-fit flex-col lg:max-w-lg"
        onClose={() => {
          setIsUpdateModalOpen(false)
          resetForm()
        }}
        open={isUpdateModalOpen}
      >
        <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#737A76]">{selectedDriver ? formatDriverId(selectedDriver.id) : ''}</span>
            <span className="text-xl font-medium text-[#0c0d0d]">Update driver</span>
          </div>
          <CloseButton
            onClick={() => {
              setIsUpdateModalOpen(false)
              resetForm()
            }}
          />
        </div>

        <DriverFields form={form} onChange={updateFormField} />

        <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
          <Button
            className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
            onClick={() => {
              setIsUpdateModalOpen(false)
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
            onClick={handleUpdateDriver}
            type="button"
          >
            Update driver
          </Button>
        </div>
      </AppModal>

      <AppModal
        className="flex max-h-fit flex-col lg:max-w-lg"
        onClose={() => {
          setIsDeleteModalOpen(false)
          resetForm()
        }}
        open={isDeleteModalOpen}
      >
        <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#737A76]">
              {selectedDriver ? formatDriverId(selectedDriver.id) : ''}
            </span>
            <span className="text-xl font-medium text-[#0c0d0d]">Delete driver</span>
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
            Are you sure you want to delete this driver?
          </span>
          <span className="text-sm font-medium text-[#0c0d0d] capitalize">
            {selectedDriver ? getDriverFullName(selectedDriver) : ''}
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
            disabled={isSubmitting || !selectedDriver}
            onClick={handleDeleteDriver}
            type="button"
            variant="destructive"
          >
            Delete driver
          </Button>
        </div>
      </AppModal>
    </section>
  )
}

function DriverFields({
  form,
  onChange,
}: {
  form: { firstName: string; lastName: string }
  onChange: (field: 'firstName' | 'lastName', value: string) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-[#121514]">
        <span className="text-xs text-[#68716C]">First name</span>
        <Input
          className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514] capitalize"
          onChange={(event) => onChange('firstName', event.target.value)}
          value={form.firstName}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-[#121514]">
        <span className="text-xs text-[#68716C]">Last name</span>
        <Input
          className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514] capitalize"
          onChange={(event) => onChange('lastName', event.target.value)}
          value={form.lastName}
        />
      </label>
    </div>
  )
}
