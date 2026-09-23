'use client'

import { Spinner } from '@/components/ui/spinner'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import WarehouseCapacitySection from '@/app/components/inventory/WarehouseCapacitySection'
import MovementVelocity from '@/app/components/inventory/MovementVelocity'
import { deleteInventory, fetchInventoryStatusCounts, fetchInventoryMovements, fetchInventoryDamageRecords, fetchInventories, insertInventory, markInventoryAsDamage, restockInventory, updateInventory } from '@/app/services/inventoryApi'
import {
  formatNumber,
  formatDate,
  formatInventoryId,
  capitalize,
  getInventoryStatusStyleFromLabel,
  formatDateForApi,
  formatPeso,
  isSelectableWarehouse,
  inventorySortOptions,
  inventoryColumns,
  getInventoryFilter,
} from '@/app/utils/helpers/inventoryHelpers'
import { exportToCSV } from '@/app/utils/exportToCsv'
import type {
  InventoryListItem,
  InventorySortBy,
  InventoryFilter,
  InventoryStatusFilter,
  WarehouseCapacity,
} from '@/app/types/inventory'
import {
  AlertTriangle,
  Plus,
  Search,
  Truck,
  Warehouse as WarehouseIcon,
  X,
} from 'lucide-react'
import SeeMoreModal from '@/app/components/modals/SeeMoreModal'
import CloseButton from '@/app/components/CloseButton'
import SortPopover from '@/app/components/SortPopover'
import { PaginationDemo } from '@/app/components/Pagination'
import StatusAction from '@/app/components/StatusAction'
import { editDeleteActions } from '@/app/utils/helpers/statusActionHelpers'
import Loading from '@/app/components/loaders/Loading'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import AppModal from '@/app/components/modals/AppModal'
import EntityDropdown from '@/app/components/EntityDropdown'
import { useInventoryProductSearch } from '@/app/hooks/useInventoryProductSearch'
import { fetchInventoryForecast } from '@/app/services/dashboardApi'
import { WarehouseListItem } from '@/app/types/warehouseCapacity'
import { fetchWarehouses } from '@/app/services/warehouseApi'
import { queryKeys } from '@/app/utils/query/queryKeys'
import { invalidateInventories } from '@/app/utils/query/queryInvalidation'
import type { InsertInventoryPayload } from '@/app/utils/api/types/inventory'
import { Input } from '@/components/ui/input'
import { DatePickerSimple } from '@/app/components/date-picker/BasicDatePicker'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const damageTypeOptions = [
  { value: 1, label: 'Current Item' },
  { value: 2, label: 'Return Item' },
]
const restockTypeOptions = [
  { value: 1, label: 'Increase Stock' },
  { value: 2, label: 'Return Stock' },
]

const inventoryStatusIds: Record<string, number> = {
  All: 0,
  available: 1,
  'low stock': 2,
  critical: 3,
}

export default function InventoryForm() {
  const [isSeeMoreOpen, setIsSeeMoreOpen] = useState(false)
  const [sortBy, setSortBy] = useState<InventorySortBy>('latest')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedItemSnapshot, setSelectedItem] = useState<InventoryListItem | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<InventoryFilter>('All')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [exportCooldown, setExportCooldown] = useState(0)
  const itemsPerPage = 10

  const selectedInventoryId = selectedItemSnapshot?.id ?? null
  const shouldLoadHistory = isSeeMoreOpen && selectedInventoryId !== null && selectedInventoryId > 0
  const movementsQuery = useQuery({
    queryKey: queryKeys.inventories.movements(selectedInventoryId),
    queryFn: () => fetchInventoryMovements(selectedInventoryId!),
    enabled: shouldLoadHistory,
  })
  const damageRecordsQuery = useQuery({
    queryKey: queryKeys.inventories.damageRecords(selectedInventoryId),
    queryFn: () => fetchInventoryDamageRecords(selectedInventoryId!),
    enabled: shouldLoadHistory,
  })
  const selectedTransactions = movementsQuery.data ?? []
  const selectedDamagedRecords = damageRecordsQuery.data ?? []

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false)
  const [damageForm, setDamageForm] = useState<{ quantity: string; reason: string; damagedType: 1 | 2 }>({ quantity: '', reason: '', damagedType: 1 })
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false)
  const [restockForm, setRestockForm] = useState<{ quantity: string; restockType: 1 | 2 }>({ quantity: '', restockType: 1 })
  const [form, setForm] = useState({
    name: '',
    quantity: '',
    productId: '',
    warehouseId: '',
    dateArrived: '',
    reorderPoint: '',
  })
  const queryClient = useQueryClient()
  const inventoriesQueryParams = {
    page: currentPage,
    pageSize: itemsPerPage,
    name: debouncedSearch || undefined,
    statusId: inventoryStatusIds[selectedFilter] ?? 0,
    filter: getInventoryFilter({ value: sortBy, order: sortOrder }),
  }
  const inventoriesQueryKey = queryKeys.inventories.all(inventoriesQueryParams)
  const {
    data: inventoriesResponse,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: inventoriesQueryKey,
    queryFn: () => fetchInventories(inventoriesQueryParams),
    keepPreviousData: true,
  })
  const { data: inventoryStatusCounts, isError: statusCountsError } = useQuery({
    queryKey: queryKeys.inventories.statusCounts,
    queryFn: ({ signal }) => fetchInventoryStatusCounts(signal),
  })
  const forecastParams = { page: 1, pageSize: 1 }
  const { data: forecastResponse } = useQuery({
    queryKey: queryKeys.dashboard.inventoryForecast(forecastParams),
    queryFn: ({ signal }) => fetchInventoryForecast(forecastParams, signal),
  })
  const shouldLoadOptions = isAddModalOpen || isEditModalOpen
  const {
    products, isLoading: isLoadingProducts, error: productsError,
  } = useInventoryProductSearch(shouldLoadOptions)
  const {
    data: warehouseItems = [],
    isLoading: isLoadingWarehouses,
  } = useQuery({
    queryKey: queryKeys.warehouses.all,
    queryFn: () => fetchWarehouses(),
    enabled: shouldLoadOptions,
  })
  const selectedItem = inventoriesResponse?.items.find((item) => item.id === selectedInventoryId) ?? selectedItemSnapshot
  const damageInventoryMutation = useMutation({
    mutationFn: markInventoryAsDamage,
    onMutate: async (payload) => {
      setIsDamageModalOpen(false)
      setDamageForm({ quantity: '', reason: '', damagedType: 1 })
      await queryClient.cancelQueries({ queryKey: ['inventories'] })
      const previousQuantity = payload.damagedType === 1
        ? queryClient.getQueryData<typeof inventoriesResponse>(inventoriesQueryKey)
          ?.items.find((item) => item.id === payload.id)?.quantity
        : undefined
      const damageKey = queryKeys.inventories.damageRecords(payload.id)
      const previousDamageRecords = queryClient.getQueryData<Awaited<ReturnType<typeof fetchInventoryDamageRecords>>>(damageKey)

      queryClient.setQueryData<typeof inventoriesResponse>(inventoriesQueryKey, (current) => current && ({
        ...current,
        items: current.items.map((item) => item.id === payload.id && payload.damagedType === 1
          ? { ...item, quantity: item.quantity - payload.quantity }
          : item),
      }))
      // Only extend loaded history so an incomplete history is never cached as complete.
      if (previousDamageRecords) {
        queryClient.setQueryData(damageKey, [
          { quantity: payload.quantity, reason: payload.reason, created_At: payload.created_At },
          ...previousDamageRecords,
        ])
      }
      return { previousQuantity, previousDamageRecords, damageKey }
    },
    onError: (error, payload, context) => {
      if (context?.previousQuantity !== undefined) {
        const quantity = context.previousQuantity
        queryClient.setQueryData<typeof inventoriesResponse>(inventoriesQueryKey, (current) => current && ({
          ...current,
          items: current.items.map((item) => item.id === payload.id ? { ...item, quantity } : item),
        }))
      }
      if (context?.previousDamageRecords) {
        queryClient.setQueryData(context.damageKey, context.previousDamageRecords)
      }
      toast.error(error instanceof Error ? error.message : 'Failed to mark inventory as damaged.')
    },
    onSuccess: () => {
      toast.success('Inventory marked as damaged successfully.')
    },
    onSettled: () => invalidateInventories(queryClient),
  })
  const restockInventoryMutation = useMutation({
    mutationFn: restockInventory,
    onSuccess: () => {
      setIsRestockModalOpen(false)
      setRestockForm({ quantity: '', restockType: 1 })
      toast.success('Inventory restocked successfully.')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to restock inventory.')
    },
    onSettled: () => invalidateInventories(queryClient),
  })
  const restockCanSubmit = selectedItem !== null && selectedItem.id > 0 &&
    Number.isSafeInteger(Number(restockForm.quantity)) && Number(restockForm.quantity) > 0

  function closeRestockModal() {
    if (!restockInventoryMutation.isPending) setIsRestockModalOpen(false)
  }

  const damageCanSubmit = selectedItem !== null && selectedItem.id > 0 &&
    Number.isSafeInteger(Number(damageForm.quantity)) && Number(damageForm.quantity) > 0 &&
    (damageForm.damagedType === 2 || Number(damageForm.quantity) <= selectedItem.quantity) &&
    damageForm.reason.trim() !== ''

  function closeDamageModal() {
    if (!damageInventoryMutation.isPending) setIsDamageModalOpen(false)
  }

  const inventories = inventoriesResponse?.items ?? []
  const inventoryRows = inventoriesResponse?.rows ?? 0
  const warehouses: WarehouseListItem[] = warehouseItems.filter(isSelectableWarehouse)
  const addInventoryMutation = useMutation({
    mutationFn: (payload: InsertInventoryPayload & { optimisticId: number }) =>
      insertInventory({
        name: payload.name,
        quantity: payload.quantity,
        productId: payload.productId,
        warehouseId: payload.warehouseId,
        dateArrived: payload.dateArrived,
        reorderPoint: payload.reorderPoint,
      }),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['inventories'] })
      const previous = queryClient.getQueryData<typeof inventoriesResponse>(inventoriesQueryKey)
      const optimisticItem: InventoryListItem = {
        id: payload.optimisticId,
        productId: payload.productId,
        name: payload.name,
        quantity: payload.quantity,
        reorderPoint: payload.reorderPoint,
        warehouseId: payload.warehouseId,
        warehouseName: warehouses.find((warehouse) => warehouse.id === payload.warehouseId)?.name ?? 'Pending...',
        status: 'pending',
        dateArrived: payload.dateArrived,
      }

      queryClient.setQueryData<typeof inventoriesResponse>(inventoriesQueryKey, (current) => {
        if (!current) return current

        return {
          ...current,
          items: [optimisticItem, ...current.items],
          rows: current.rows + 1,
        }
      })

      return { previous }
    },
    onError: (err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(inventoriesQueryKey, context.previous)
      toast.error(err instanceof Error ? err.message : 'Failed to add inventory item.')
    },
    onSuccess: () => {
      resetForm()
      toast.success('Inventory item added successfully.')
    },
    onSettled: () => invalidateInventories(queryClient),
  })
  const updateInventoryMutation = useMutation({
    mutationFn: updateInventory,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['inventories'] })
      const previous = queryClient.getQueryData<typeof inventoriesResponse>(inventoriesQueryKey)

      queryClient.setQueryData<typeof inventoriesResponse>(inventoriesQueryKey, (current) => {
        if (!current) return current

        return {
          ...current,
          items: current.items.map((item) =>
            item.id === payload.id
              ? {
                  ...item,
                  productId: payload.productId,
                  name: payload.name,
                  warehouseId: payload.warehouseId,
                  warehouseName: warehouses.find((warehouse) => warehouse.id === payload.warehouseId)?.name ?? item.warehouseName,
                  reorderPoint: payload.reorderPoint,
                }
              : item
          ),
        }
      })

      return { previous }
    },
    onError: (err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(inventoriesQueryKey, context.previous)
      toast.error(err instanceof Error ? err.message : 'Failed to update inventory item.')
    },
    onSuccess: () => toast.success('Inventory item updated successfully.'),
    onSettled: () => invalidateInventories(queryClient),
  })
  const deleteInventoryMutation = useMutation({
    mutationFn: deleteInventory,
    onMutate: async (inventoryId) => {
      await queryClient.cancelQueries({ queryKey: ['inventories'] })
      const previous = queryClient.getQueryData<typeof inventoriesResponse>(inventoriesQueryKey)

      queryClient.setQueryData<typeof inventoriesResponse>(inventoriesQueryKey, (current) => {
        if (!current) return current

        return {
          ...current,
          items: current.items.filter((item) => item.id !== inventoryId),
          rows: Math.max(current.rows - 1, 0),
        }
      })

      return { previous }
    },
    onError: (err, _inventoryId, context) => {
      if (context?.previous) queryClient.setQueryData(inventoriesQueryKey, context.previous)
      toast.error(err instanceof Error ? err.message : 'Failed to delete inventory item.')
    },
    onSuccess: () => toast.success('Inventory item deleted successfully.'),
    onSettled: () => invalidateInventories(queryClient),
  })
  const isSubmitting =
    addInventoryMutation.isPending ||
    updateInventoryMutation.isPending ||
    deleteInventoryMutation.isPending ||
    damageInventoryMutation.isPending ||
    restockInventoryMutation.isPending

  const formCanSubmit =
    form.name.trim() !== '' &&
    form.quantity.trim() !== '' &&
    Number(form.quantity) > 0 &&
    form.productId.trim() !== '' &&
    form.warehouseId.trim() !== '' &&
    form.dateArrived.trim() !== '' &&
    form.reorderPoint.trim() !== '' &&
    Number(form.reorderPoint) >= 0

  const editFormCanSubmit =
    form.name.trim() !== '' &&
    form.productId.trim() !== '' &&
    form.warehouseId.trim() !== '' &&
    form.reorderPoint.trim() !== '' &&
    Number(form.reorderPoint) >= 0

  const selectedProductLabel = products.find((p) => String(p.id) === form.productId)?.name ?? ''
  const selectedWarehouseLabel = warehouses.find((w) => String(w.id) === form.warehouseId)?.name ?? ''

  function updateFormField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function resetForm() {
    setForm({ name: '', quantity: '', productId: '', warehouseId: '', dateArrived: '', reorderPoint: '' })
  }

  async function handleAddInventory() {
    if (!formCanSubmit) return

    setIsAddModalOpen(false)
    addInventoryMutation.mutate({
      optimisticId: -Date.now(),
      name: form.name,
      quantity: Number(form.quantity),
      productId: Number(form.productId),
      warehouseId: Number(form.warehouseId),
      dateArrived: formatDateForApi(form.dateArrived),
      reorderPoint: Number(form.reorderPoint),
    })
  }

  async function handleUpdateInventory() {
    if (!selectedItem || !editFormCanSubmit) return

    const inventoryId = selectedItem.id
    const productId = Number(form.productId)
    const warehouseId = Number(form.warehouseId)

    setIsEditModalOpen(false)
    resetForm()

    updateInventoryMutation.mutate({
      id: inventoryId,
      name: form.name.trim(),
      productId,
      warehouseId,
      reorderPoint: Number(form.reorderPoint),
    })
  }

  async function handleDeleteInventory() {
    if (!selectedItem) return

    const inventoryId = selectedItem.id

    setIsDeleteModalOpen(false)
    resetForm()
    deleteInventoryMutation.mutate(inventoryId)
  }

  function openEditModal(item: InventoryListItem) {
    setSelectedItem(item)
    setForm({
      name: item.name,
      quantity: String(item.quantity),
      productId: String(item.productId),
      warehouseId: String(item.warehouseId),
      dateArrived: item.dateArrived,
      reorderPoint: String(item.reorderPoint),
    })
    setIsEditModalOpen(true)
  }

  function openDeleteModal(item: InventoryListItem) {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }
  const forecastWarningCount = forecastResponse?.rows ?? 0


  const warehouseCapacity: WarehouseCapacity = {
    warehouse: 'All warehouses',
    used: inventories.reduce((sum, item) => sum + item.quantity, 0),
    total: 1000,
  }

  const allInventoryCount = inventoryStatusCounts?.reduce((total, item) => total + item.count, 0) ?? 0
  const inventoryStatusFilters: InventoryStatusFilter[] = [
    { label: 'All', count: allInventoryCount },
    ...(inventoryStatusCounts ?? []).map((item) => ({
      label: item.status,
      count: item.count,
    })),
  ]
  const selectedInventoryCount = inventoryStatusFilters.find(
    (filter) => filter.label === selectedFilter
  )?.count ?? 0

  const totalPages = Math.max(1, inventoriesResponse?.pageCount ?? 1)
  const paginatedInventories = inventories

  const selectedStatusStyle = selectedItem ? getInventoryStatusStyleFromLabel(selectedItem.status) : null

  useEffect(() => {
  if (exportCooldown <= 0) return

  const timer = setTimeout(() => {
    setExportCooldown((prev) => prev - 1)
  }, 1000)

  return () => clearTimeout(timer)
}, [exportCooldown])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setCurrentPage(1)
    }, 400)

    return () => clearTimeout(timeout)
  }, [search])

  return (
    <main className="flex h-dvh w-full p-3 xl:p-6 bg-white">
      <div className="flex w-full flex-col gap-5 flex-1 min-h-0 overflow-y-auto scrollbar-none">
        <header>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#0c0d0d]">Inventory</h1>
          <p className="mt-2 text-sm text-[#68716C]">Forecast inventory health and act on upcoming stockouts.</p>
        </header>

        <section className="grid xl:grid-cols-2 gap-4 min-w-0 columns-1">
            <article className="flex flex-col rounded-2xl border border-[#DCE4DE] bg-white p-5 shadow-sm h-full">
              <div className="flex items-start justify-between">
                <p className="text-sm text-[#68716C]">Forecast risks</p>
                <span className="rounded-xl bg-[#FBE7E7] p-2 text-[#B42318]"><AlertTriangle className="h-5 w-5" /></span>
              </div>
              <p className="flex flex-1 mt-4 text-7xl font-semibold text-[#0c0d0d]">{forecastWarningCount}</p>
                <p className="mt-2 text-sm text-[#68716C]">products forecast to run out</p>
            </article>

            <MovementVelocity />
        </section>

        <section id="RawMaterials" className="relative flex w-full scroll-mt-6 flex-col rounded-2xl p-4 shadow-sm lg:p-5 border border-[#DCE4DE]">
          <span id="Risks" className="absolute -top-6" aria-hidden="true" />
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-medium tracking-tight text-[#121514]">Inventory items</h2>
              <span className="rounded-md border border-[#DFE2E0] px-3 py-1 text-sm text-[#121514]">
                {inventoryStatusCounts && !statusCountsError ? selectedInventoryCount.toLocaleString() : '-'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Search inventory"
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


                variant="outline"
                className={`h-auto rounded-xl border border-[#DFE2E0] px-3 py-2 text-sm whitespace-nowrap transition-colors
                  ${exportCooldown > 0 ? "bg-gray-100 cursor-not-allowed text-gray-500" : "hover:bg-[#DCE4DF] cursor-pointer text-black"}
                  `}
                type="button"
                disabled={exportCooldown > 0}
                onClick={() => {
                  exportToCSV(
                    paginatedInventories,
                    [
                      {
                        header: 'Inventory ID',
                        value: (item) => formatInventoryId(String(item.id)),
                      },
                      {
                        header: 'Product',
                        value: (item) => item.name,
                      },
                      {
                        header: 'Available',
                        value: (item) => item.quantity,
                      },
                      {
                        header: 'Reorder point',
                        value: (item) => item.reorderPoint,
                      },
                      {
                        header: 'Warehouse',
                        value: (item) => item.warehouseName,
                      },
                      {
                        header: 'Status',
                        value: (item) => item.status,
                      },
                      {
                        header: 'Date arrived',
                        value: (item) => formatDate(item.dateArrived),
                      },
                    ],
                    'inventory'
                  )

                  setExportCooldown(10)
                }}
              >
                {exportCooldown > 0 ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Cooldown
                  </>
                ) : 'Export to CSV'}
              </Button>
              
              {inventoryStatusFilters.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => {
                    setSelectedFilter(filter.label)
                    setCurrentPage(1)
                  }}
                  className={`cursor-pointer rounded-xl border px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                    selectedFilter === filter.label
                      ? 'border-[#121514] bg-[#121514] text-white'
                      : 'border-[#E1E4E2] bg-white text-[#121514] hover:bg-[#DCE4DF]'
                  }`}
                >
                  {filter.label === 'All' ? 'All' : capitalize(filter.label)}
                  <span className="ml-1">{inventoryStatusCounts && !statusCountsError ? filter.count.toLocaleString() : '-'}</span>
                </button>
              ))}

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

              <Button
                className="rounded-xl cursor-pointer px-3 py-2 text-sm"
                onClick={() => setIsAddModalOpen(true)}
                type="button"
              >
                <Plus className="h-4 w-4" />
                Add inventory
              </Button>
            </div>
          </div>

          <div className="mt-5 min-h-0 overflow-auto">
            <table className="w-full min-w-200 border-separate border-spacing-y-2 text-left">
              <thead className="text-sm font-normal text-[#737A76]">
                <tr>
                  {inventoryColumns.map((column) => (
                    <th className="px-3 pb-1 font-normal" key={column} scope="col">
                      {column}
                    </th>
                  ))}
                  <th aria-label="Inventory actions" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={inventoryColumns.length + 1} className="px-3 py-4 text-center text-sm text-[#737A76]">
                      <span className='flex h-96'><Loading /></span>
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={inventoryColumns.length + 1} className="px-3 py-4 text-center text-sm text-[#B42318]">
                      {loadError instanceof Error ? loadError.message : 'Failed to load inventory'}
                    </td>
                  </tr>
                ) : paginatedInventories.length === 0 ? (
                  <tr>
                    <td colSpan={inventoryColumns.length + 1} className="px-3 py-4 text-center text-sm text-[#737A76]">
                      No inventory items found.
                    </td>
                  </tr>
                ) : (
                  paginatedInventories.map((item) => {
                    const statusStyle = getInventoryStatusStyleFromLabel(item.status)

                    return (
                      <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={item.id}>
                        <td className="rounded-l-xl px-3 py-4 font-medium whitespace-nowrap">{formatInventoryId(String(item.id))}</td>
                        <td className="px-3 py-4 font-medium whitespace-nowrap capitalize">{item.name}</td>
                        <td className="px-3 py-4 whitespace-nowrap">{formatNumber(item.quantity)}</td>
                        <td className="px-3 py-4 whitespace-nowrap">{formatNumber(item.reorderPoint)}</td>
                        <td className="px-3 py-4 font-medium whitespace-nowrap capitalize">{item.warehouseName}</td>
                        <td className={`px-3 py-4 font-medium whitespace-nowrap ${statusStyle.labelClassName}`}>
                          <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${statusStyle.dotClassName}`} />
                          {capitalize(item.status)}
                        </td>
                        <td className="rounded-r-xl px-3 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-1.5 text-sm whitespace-nowrap transition-all hover:bg-[#DCE4DF]"
                              type="button"
                              onClick={() => {
                                setSelectedItem(item)
                                setIsSeeMoreOpen(true)
                              }}
                            >
                              See more
                            </button>
                            <StatusAction
                              actions={[
                                ...editDeleteActions, 
                                { label: 'Restock', value: 'restock', icon: Plus }, 
                                { label: 'Mark as damage', value: 'damage', icon: AlertTriangle, variant: 'destructive' }, ]}
                              label={`More actions for inventory ${item.id}`}
                              onAction={(action) => {
                                if (action === 'damage' && item.id > 0 && !isSubmitting) {
                                  setSelectedItem(item)
                                  setDamageForm({ quantity: '', reason: '', damagedType: 1 })
                                  setIsDamageModalOpen(true)
                                }
                                if (action === 'restock' && item.id > 0 && !isSubmitting) {
                                  setSelectedItem(item)
                                  setRestockForm({ quantity: '', restockType: 1 })
                                  setIsRestockModalOpen(true)
                                }
                                if (action === 'edit' && !isSubmitting) openEditModal(item)
                                if (action === 'delete' && !isSubmitting) openDeleteModal(item)
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 w-full justify-between items-center">
            <span className="text-sm text-[#737A76]">
              Showing {paginatedInventories.length} of {inventoryRows} inventory items
            </span>

            <div className="flex">
              <PaginationDemo currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        </section>

        <WarehouseCapacitySection initialCapacity={warehouseCapacity} />
      </div>

      <AppModal open={isDamageModalOpen} onClose={closeDamageModal} className="flex max-h-fit flex-col lg:max-w-lg">
        <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#737A76]">{selectedItem ? formatInventoryId(String(selectedItem.id)) : ''}</span>
            <span className="text-xl font-medium text-[#0c0d0d]">Mark as damage</span>
          </div>
          <CloseButton onClick={closeDamageModal} />
        </div>
        <form onSubmit={(event) => {
          event.preventDefault()
          if (!damageCanSubmit || !selectedItem || damageInventoryMutation.isPending) return
          damageInventoryMutation.mutate({ id: selectedItem.id, damagedType: damageForm.damagedType, quantity: Number(damageForm.quantity), reason: damageForm.reason.trim(), created_At: new Date().toISOString() })
        }}>
          <div className="flex flex-col gap-4 p-4">
            <p className="text-sm text-[#68716C]">
              {selectedItem?.name} · {formatNumber(selectedItem?.quantity ?? 0)} available.{' '}
              {damageForm.damagedType === 1 ? 'Damaged quantity will be deducted from stock.' : 'Returned damage does not change current stock.'}
            </p>
            <div className="flex flex-col gap-1 text-sm text-[#121514]">
              <label htmlFor="damage-type" className="text-xs text-[#68716C]">Damage type</label>
              <Select items={damageTypeOptions} value={damageForm.damagedType} disabled={damageInventoryMutation.isPending} onValueChange={(value) => {
                if (value === 1 || value === 2) setDamageForm((previous) => ({ ...previous, damagedType: value }))
              }}>
                <SelectTrigger id="damage-type" className="h-10 w-full rounded-xl border-[#DFE2E0] bg-white px-3 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {damageTypeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Quantity</span>
              <Input required type="number" min={1} max={damageForm.damagedType === 1 ? selectedItem?.quantity : undefined} step={1} disabled={damageInventoryMutation.isPending} value={damageForm.quantity} onChange={(event) => setDamageForm((previous) => ({ ...previous, quantity: event.target.value }))} className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Reason</span>
              <Textarea required disabled={damageInventoryMutation.isPending} value={damageForm.reason} onChange={(event) => setDamageForm((previous) => ({ ...previous, reason: event.target.value }))} className="h-28 min-h-28 max-h-28 resize-none field-sizing-fixed overflow-y-auto rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]" />
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
            <Button type="button" variant="outline" className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm" disabled={damageInventoryMutation.isPending} onClick={closeDamageModal}>Cancel</Button>
            <Button type="submit" variant="destructive" className="rounded-xl px-3 py-2 text-sm" disabled={!damageCanSubmit || damageInventoryMutation.isPending}>{damageInventoryMutation.isPending ? 'Saving...' : 'Mark as damage'}</Button>
          </div>
        </form>
      </AppModal>

      <AppModal open={isRestockModalOpen} onClose={closeRestockModal} className="flex max-h-fit flex-col lg:max-w-lg">
        <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#737A76]">{selectedItem ? formatInventoryId(String(selectedItem.id)) : ''}</span>
            <span className="text-xl font-medium text-[#0c0d0d]">Restock inventory</span>
          </div>
          <CloseButton onClick={closeRestockModal} />
        </div>
        <form onSubmit={(event) => {
          event.preventDefault()
          if (!restockCanSubmit || !selectedItem || restockInventoryMutation.isPending) return
          restockInventoryMutation.mutate({ id: selectedItem.id, quantity: Number(restockForm.quantity), restockType: restockForm.restockType })
        }}>
          <div className="flex flex-col gap-4 p-4">
            <p className="text-sm text-[#68716C]">{selectedItem?.name} ? {formatNumber(selectedItem?.quantity ?? 0)} available.</p>
            <div className="flex flex-col gap-1 text-sm text-[#121514]">
              <label htmlFor="restock-type" className="text-xs text-[#68716C]">Restock type</label>
              <Select items={restockTypeOptions} value={restockForm.restockType} disabled={restockInventoryMutation.isPending} onValueChange={(value) => {
                if (value === 1 || value === 2) setRestockForm((previous) => ({ ...previous, restockType: value }))
              }}>
                <SelectTrigger id="restock-type" className="h-10 w-full rounded-xl border-[#DFE2E0] bg-white px-3 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {restockTypeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Quantity</span>
              <Input required type="number" min={1} step={1} disabled={restockInventoryMutation.isPending} value={restockForm.quantity} onChange={(event) => setRestockForm((previous) => ({ ...previous, quantity: event.target.value }))} className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm" />
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
            <Button type="button" variant="outline" className="rounded-xl border border-[#DFE2E0] px-3 py-2 text-sm" disabled={restockInventoryMutation.isPending} onClick={closeRestockModal}>Cancel</Button>
            <Button type="submit" className="rounded-xl px-3 py-2 text-sm" disabled={!restockCanSubmit || restockInventoryMutation.isPending}>
              {restockInventoryMutation.isPending ? <><Spinner data-icon="inline-start" />Saving...</> : 'Restock'}
            </Button>
          </div>
        </form>
      </AppModal>

      <SeeMoreModal open={isSeeMoreOpen} onClose={() => setIsSeeMoreOpen(false)} className="flex flex-col h-auto lg:max-h-[70vh]">
        <div className="flex gap-2 w-full border-b border-[#E2E2E2] p-4 justify-between items-center">
          <div className="flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs">{selectedItem ? formatInventoryId(String(selectedItem.id)) : ''}</span>

              {selectedStatusStyle && (
                <span className={`text-sm font-medium inline-flex items-center gap-1 ${selectedStatusStyle.labelClassName}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${selectedStatusStyle.dotClassName}`} />
                  {selectedItem ? capitalize(selectedItem.status) : ''}
                </span>
              )}
            </div>
            <span className="text-xl font-medium text-[#0c0d0d] capitalize">{selectedItem?.name}</span>
          </div>
          <CloseButton onClick={() => setIsSeeMoreOpen(false)} />
        </div>

        <div className="flex flex-col w-full h-full overflow-y-auto">
          <div className="flex flex-col w-full h-fit p-4 gap-4">
            <div className="grid grid-cols-2 w-full gap-4">
              <div className="flex items-center px-3 w-full gap-2 h-16 rounded-lg bg-[#F0F1F1]">
                <span className="flex shrink-0 items-center justify-center w-10 h-10 rounded-xl bg-[#1B1C1C]">
                  <WarehouseIcon className="text-[#777777] w-6 h-6" />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs">Warehouse</span>
                  <span className="text-base font-semibold capitalize">{selectedItem?.warehouseName}</span>
                </div>
              </div>

              <div className="flex items-center px-3 w-full gap-2 h-16 rounded-lg bg-[#F0F1F1]">
                <span className="flex shrink-0 items-center justify-center w-10 h-10 rounded-xl bg-[#1B1C1C]">
                  <Truck className="text-[#777777] w-6 h-6" />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs">Date arrived</span>
                  <span className="text-base font-semibold">
                    {selectedItem ? formatDate(selectedItem.dateArrived) : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full h-full p-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase">Inventory status</span>
              <div className="border-b border-[#E2E2E2] flex w-full h-px" />
            </div>

            <div className="flex flex-col w-full bg-[#F0F1F1] mt-4 rounded-xl p-4">
              <div className="flex w-full justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-5xl font-semibold text-[#0c0d0d]">{selectedItem?.quantity}</span>
                  <span className="text-base font-light capitalize">{selectedItem?.name} available</span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[#0c0d0d] text-2xl font-medium">{selectedItem?.reorderPoint}</span>
                  <span className="font-light text-[#0c0d0d]">Reorder point</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-8">
              <span className="text-xs uppercase text-[#121514]">Recent movements</span>
              <div className="border-b border-[#E2E2E2] flex w-full h-px" />
            </div>

            <div className="mt-4 flex w-full flex-col gap-2 max-h-72 overflow-auto scrollbar-none">
              {movementsQuery.isLoading && shouldLoadHistory ? (
                <div role="status" className="flex min-h-24 items-center justify-center rounded-xl bg-[#F0F1F1] text-sm text-[#737A76]">Loading movements...</div>
              ) : movementsQuery.isError ? (
                <div role="alert" className="flex min-h-24 items-center justify-center gap-2 rounded-xl bg-[#F0F1F1] p-4 text-sm text-[#B42318]">
                  Unable to load movements.
                  <button type="button" className="cursor-pointer underline" onClick={() => movementsQuery.refetch()}>Retry</button>
                </div>
              ) : selectedTransactions.length === 0 ? (
                <div className="flex min-h-24 w-full items-center justify-center rounded-xl bg-[#F0F1F1] text-sm text-[#737A76]">
                  No movements found.
                </div>
              ) : (
                selectedTransactions.map((record, index) => (
                  <div key={record.created_At + '-' + index} className="flex items-center justify-between gap-4 p-2">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-sm font-medium text-[#121514] capitalize">{record.label}</span>
                      <span className="text-xs text-[#737A76]">{formatDate(record.created_At)}</span>
                    </div>
                    <span className={record.quantity < 0 ? 'shrink-0 text-sm font-semibold text-[#B42318]' : 'shrink-0 text-sm font-semibold text-[#187B49]'}>
                      {record.quantity > 0 ? '+' : ''}{formatNumber(record.quantity)} units
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col gap-2 mt-8">
              <span className="text-xs uppercase text-[#121514]">Damaged inventory</span>
              <div className="border-b border-[#E2E2E2] flex w-full h-px" />
            </div>

            <div className="mt-4 flex w-full flex-col gap-2 max-h-72 overflow-auto scrollbar-none">
              {damageRecordsQuery.isLoading && shouldLoadHistory ? (
                <div role="status" className="flex min-h-24 items-center justify-center rounded-xl bg-[#F0F1F1] text-sm text-[#737A76]">Loading damage reports...</div>
              ) : damageRecordsQuery.isError ? (
                <div role="alert" className="flex min-h-24 items-center justify-center gap-2 rounded-xl bg-[#F0F1F1] p-4 text-sm text-[#B42318]">
                  Unable to load damage reports.
                  <button type="button" className="cursor-pointer underline" onClick={() => damageRecordsQuery.refetch()}>Retry</button>
                </div>
              ) : selectedDamagedRecords.length === 0 ? (
                <div className="flex min-h-24 w-full items-center justify-center rounded-xl bg-[#F0F1F1] text-sm text-[#737A76]">
                  No damage reports.
                </div>
              ) : (
                selectedDamagedRecords.map((record, index) => (
                  <div key={record.created_At + '-' + index} className="flex flex-col gap-2 p-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-[#B42318]">{formatNumber(record.quantity)} units damaged</span>
                      <span className="text-xs text-[#737A76]">{formatDate(record.created_At)}</span>
                    </div>
                    <p className="whitespace-pre-wrap wrap-anywhere text-sm text-[#121514]">{record.reason}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SeeMoreModal>

      <AppModal
        className="flex max-h-fit flex-col lg:max-w-lg"
        onClose={() => setIsAddModalOpen(false)}
        open={isAddModalOpen}
      >
        <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#737A76]">New stock entry</span>
            <span className="text-xl font-medium text-[#0c0d0d]">Add inventory</span>
          </div>
          <CloseButton onClick={() => setIsAddModalOpen(false)} />
        </div>

        <div className="flex flex-col gap-4 p-4">
          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Name</span>
            <Input
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514] capitalize"
              onChange={(event) => updateFormField('name', event.target.value)}
              value={form.name}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Quantity</span>
            <Input
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              min={1}
              onChange={(event) => updateFormField('quantity', event.target.value)}
              type="number"
              value={form.quantity}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Product</span>
            <EntityDropdown
              options={products.map((p) => ({
                id: p.id,
                label: p.name,
                sublabel: `${p.categoryName} · ${formatPeso(p.price)}`,
              }))}
              value={selectedProductLabel}
              placeholder="Select a product"
              emptyLabel={productsError ? "Failed to load products. Try searching again." : "No products found."}
              addHref="/dashboard/product"
              addLabel="Add product"
              isLoading={isLoadingProducts}
              searchPlaceholder="Search products..."
              onSelect={(id) => updateFormField('productId', String(id))}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Warehouse</span>
            <EntityDropdown
              options={warehouses.map((w) => ({
                id: w.id,
                label: w.name,
                sublabel: w.address,
              }))}
              value={selectedWarehouseLabel}
              placeholder="Select a warehouse"
              emptyLabel="No warehouses found."
              addHref="/dashboard/inventory#WarehouseCapacity"
              addLabel="Add warehouse"
              isLoading={isLoadingWarehouses}
              onSelect={(id) => updateFormField('warehouseId', String(id))}
            />
          </label>

          <DatePickerSimple
            label="Date arrived"
            value={form.dateArrived}
            onChange={(value) => updateFormField('dateArrived', value)}
          />

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Reorder point</span>
            <Input
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              min={0}
              onChange={(event) => updateFormField('reorderPoint', event.target.value)}
              type="number"
              value={form.reorderPoint}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
          <Button
            className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
            onClick={() => setIsAddModalOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl px-3 py-2 text-sm"
            disabled={!formCanSubmit || isSubmitting}
            onClick={handleAddInventory}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add inventory
          </Button>
        </div>
      </AppModal>

      <AppModal
        className="flex max-h-fit flex-col lg:max-w-lg"
        onClose={() => {
          setIsEditModalOpen(false)
          resetForm()
        }}
        open={isEditModalOpen}
      >
        <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#737A76]">{selectedItem ? formatInventoryId(String(selectedItem.id)) : ''}</span>
            <span className="text-xl font-medium text-[#0c0d0d]">Edit inventory</span>
          </div>
          <CloseButton
            onClick={() => {
              setIsEditModalOpen(false)
              resetForm()
            }}
          />
        </div>

        <div className="flex flex-col gap-4 p-4">
          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Name</span>
            <Input
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => updateFormField('name', event.target.value)}
              value={form.name}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Product</span>
            <EntityDropdown
              options={products.map((p) => ({
                id: p.id,
                label: p.name,
                sublabel: `${p.categoryName} Â· ${formatPeso(p.price)}`,
              }))}
              value={selectedProductLabel}
              placeholder="Select a product"
              emptyLabel={productsError ? "Failed to load products. Try searching again." : "No products found."}
              addHref="/dashboard/product"
              addLabel="Add product"
              isLoading={isLoadingProducts}
              searchPlaceholder="Search products..."
              onSelect={(id) => updateFormField('productId', String(id))}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Warehouse</span>
            <EntityDropdown
              options={warehouses.map((w) => ({
                id: w.id,
                label: w.name,
                sublabel: w.address,
              }))}
              value={selectedWarehouseLabel}
              placeholder="Select a warehouse"
              emptyLabel="No warehouses found."
              addHref="/dashboard/inventory#WarehouseCapacity"
              addLabel="Add warehouse"
              isLoading={isLoadingWarehouses}
              onSelect={(id) => updateFormField('warehouseId', String(id))}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Reorder point</span>
            <Input
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              min={0}
              onChange={(event) => updateFormField('reorderPoint', event.target.value)}
              type="number"
              value={form.reorderPoint}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
          <Button
            className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
            onClick={() => {
              setIsEditModalOpen(false)
              resetForm()
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl px-3 py-2 text-sm"
            disabled={!editFormCanSubmit || isSubmitting}
            onClick={handleUpdateInventory}
            type="button"
          >
            Save changes
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
            <span className="text-xs text-[#737A76]">{selectedItem ? formatInventoryId(String(selectedItem.id)) : ''}</span>
            <span className="text-xl font-medium text-[#0c0d0d]">Delete inventory</span>
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
            Are you sure you want to delete this inventory item?
          </span>
          <span className="text-sm font-medium text-[#0c0d0d] capitalize">
            {selectedItem?.name}
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
            disabled={isSubmitting || !selectedItem}
            onClick={handleDeleteInventory}
            type="button"
            variant="destructive"
          >
            Delete inventory
          </Button>
        </div>
      </AppModal>
    </main>
  )
}
