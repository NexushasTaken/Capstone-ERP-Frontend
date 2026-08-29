'use client'

import { useEffect, useState } from 'react'
import WarehouseCapacitySection from '@/app/components/inventory/WarehouseCapacitySection'
import MovementVelocity from '@/app/components/inventory/MovementVelocity'
import { fetchInventories, insertInventory } from '@/app/utils/api/inventoryApi'
import {
  formatNumber,
  formatDate,
  formatInventoryId,
  capitalize,
  getInventoryStatusStyleFromLabel,
  getRiskStyle,
  formatDateForApi,
  formatPeso,
} from '@/app/utils/helpers/inventoryHelpers'
import { exportToCSV } from '@/app/utils/exportToCsv'
import type {
  InventoryListItem,
  InventorySortBy,
  InventoryFilter,
  InventoryStatusFilter,
  PredictedStockout,
  MovementVelocityItem,
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
import { fetchProducts } from '@/app/utils/api/productApi'
import { ProductListItem } from '@/app/types/product'
import { WarehouseListItem } from '@/app/types/warehouseCapacity'
import { fetchWarehouses } from '@/app/utils/api/warehouseApi'

const inventoryColumns = ['Inventory ID', 'Name', 'Quantity', 'Reorder point', 'Warehouse', 'Status']

const inventorySortOptions = [
  { label: 'Name (A → Z)', value: 'name' as InventorySortBy, order: 'asc' as const },
  { label: 'Name (Z → A)', value: 'name' as InventorySortBy, order: 'desc' as const },
  { label: 'Quantity (High → Low)', value: 'quantity' as InventorySortBy, order: 'desc' as const },
  { label: 'Quantity (Low → High)', value: 'quantity' as InventorySortBy, order: 'asc' as const },
  { label: 'Reorder point', value: 'reorderPoint' as InventorySortBy, order: 'desc' as const },
]

export default function InventoryForm() {
  const [inventories, setInventories] = useState<InventoryListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [isSeeMoreOpen, setIsSeeMoreOpen] = useState(false)
  const [sortBy, setSortBy] = useState<InventorySortBy>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedItem, setSelectedItem] = useState<InventoryListItem | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<InventoryFilter>('All')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [stockoutCurrentPage, setStockoutCurrentPage] = useState(1)
  const itemsPerPage = 10
  const stockoutItemsPerPage = 10

  const selectedTransactions: never[] = []
  const selectedDamagedRecords: never[] = []

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isSearchingProducts, setIsSearchingProducts] = useState(false)
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([])
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false) 

  const [form, setForm] = useState({
    name: '',
    quantity: '',
    productId: '',
    warehouseId: '',
    dateArrived: '',
    reorderPoint: '',
  })

  const formCanSubmit =
    form.name.trim() !== '' &&
    form.quantity.trim() !== '' &&
    Number(form.quantity) > 0 &&
    form.productId.trim() !== '' &&
    form.warehouseId.trim() !== '' &&
    form.dateArrived.trim() !== '' &&
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

    const tempId = -Date.now()

    const optimisticItem: InventoryListItem = {
      id: tempId,
      productId: Number(form.productId),
      name: form.name,
      quantity: Number(form.quantity),
      reorderPoint: Number(form.reorderPoint),
      warehouseId: Number(form.warehouseId),
      warehouseName: 'Pending…',
      status: 'pending',
      dateArrived: form.dateArrived,
    }

    setInventories((prev) => [optimisticItem, ...prev])
    setIsAddModalOpen(false)
    setIsSubmitting(true)

    try {
      await insertInventory({
        name: form.name,
        quantity: Number(form.quantity),
        productId: Number(form.productId),
        warehouseId: Number(form.warehouseId),
        dateArrived: formatDateForApi(form.dateArrived),
        reorderPoint: Number(form.reorderPoint),
      })

      const { items } = await fetchInventories({ page: 1, pageSize: 100 })
      setInventories(items)

      toast.success('Inventory item added successfully.')
      resetForm()
    } catch (err) {
      setInventories((prev) => prev.filter((item) => item.id !== tempId))
      toast.error(err instanceof Error ? err.message : 'Failed to add inventory item.')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setIsLoading(true)
        setLoadError(null)
        const { items } = await fetchInventories({ page: 1, pageSize: 100 })
        if (!cancelled) setInventories(items)
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load inventory')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isAddModalOpen) return
    let cancelled = false

    async function loadOptions() {
      setIsLoadingProducts(true)
      setIsLoadingWarehouses(true)
      try {
        const [productResponse, warehouseItems] = await Promise.all([
          fetchProducts(),
          fetchWarehouses(),
        ])
        if (!cancelled) {
          setProducts(productResponse.items)
          setWarehouses(warehouseItems)
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : 'Failed to load products/warehouses.')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProducts(false)
          setIsLoadingWarehouses(false)
        }
      }
    }

    loadOptions()
    return () => {
      cancelled = true
    }
  }, [isAddModalOpen])

  const criticalInventories = inventories.filter((item) => item.status === 'critical')

  const forecastWarningCount = criticalInventories.length

  const predictedStockouts: PredictedStockout[] = criticalInventories.map((item) => ({
    inventoryId: String(item.id),
    product: item.name,
    warehouse: item.warehouseName,
    availableUnits: item.quantity,
    reorderPoint: item.reorderPoint,
    estimatedStockoutDate: 'Within 7 days',
    risk: 'critical',
  }))

  const movementVelocity: MovementVelocityItem[] = []

  const warehouseCapacity: WarehouseCapacity = {
    warehouse: 'All warehouses',
    used: inventories.reduce((sum, item) => sum + item.quantity, 0),
    total: 1000,
  }

  const inventoryStatusFilters: InventoryStatusFilter[] = [
    { label: 'All', count: inventories.length },
    ...Array.from(new Set(inventories.map((item) => item.status))).map((status) => ({
      label: status,
      count: inventories.filter((item) => item.status === status).length,
    })),
  ]

  const filteredInventories = inventories.filter((item) => {
    const matchesFilter = selectedFilter === 'All' || item.status === selectedFilter

    const matchesSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.warehouseName.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const totalPages = Math.ceil(filteredInventories.length / itemsPerPage)
  const displayedInventories = [...filteredInventories].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)

      case 'quantity':
        return sortOrder === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity

      case 'reorderPoint':
        return sortOrder === 'asc' ? a.reorderPoint - b.reorderPoint : b.reorderPoint - a.reorderPoint

      case 'warehouse':
        return sortOrder === 'asc'
          ? a.warehouseName.localeCompare(b.warehouseName)
          : b.warehouseName.localeCompare(a.warehouseName)

      default:
        return 0
    }
  })

  const paginatedInventories = displayedInventories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const stockoutTotalPages = Math.ceil(predictedStockouts.length / stockoutItemsPerPage)
  const paginatedStockouts = predictedStockouts.slice(
    (stockoutCurrentPage - 1) * stockoutItemsPerPage,
    stockoutCurrentPage * stockoutItemsPerPage
  )

  async function handleProductSearch(query: string) {
    setIsSearchingProducts(true)
    try {
      const { items } = await fetchProducts(query ? { name: query } : {})
      setProducts(items)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to search products.')
    } finally {
      setIsSearchingProducts(false)
    }
  }

  const selectedStatusStyle = selectedItem ? getInventoryStatusStyleFromLabel(selectedItem.status) : null

  return (
    <main className="flex h-screen w-full p-6 bg-white">
      <div className="flex w-full flex-col gap-5 flex-1 min-h-0 overflow-y-auto scrollbar-none">
        <header>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#0c0d0d]">Inventory</h1>
          <p className="mt-2 text-sm text-[#68716C]">Forecast inventory health and act on upcoming stockouts.</p>
        </header>

        <section className="grid gap-4 lg:grid-cols-2 min-w-0 columns-1">
          {/* PREDICTED STOCKOUTS */}
          <article className="min-w-0 rounded-2xl border border-[#DCE4DE] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E7ECE8] p-5">
              <div>
                <h2 className="font-semibold text-[#0c0d0d]">Predicted stockouts</h2>
                <p className="mt-1 text-xs lg:text-sm text-[#68716C]">Products marked Critical and likely to run out soon</p>
              </div>
              <span className="rounded-lg bg-[#FBE7E7] px-2.5 py-1 text-xs font-semibold text-[#B42318]">{forecastWarningCount} risks</span>
            </div>
            <div className="max-h-85 overflow-auto">
              <table className="w-full min-w-162.5 text-left text-sm">
                <thead className="sticky top-0 z-10 bg-[#F7F9F7] text-xs uppercase tracking-wide text-[#68716C]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Available</th>
                    <th className="px-4 py-3 font-medium">Reorder point</th>
                    <th className="px-4 py-3 font-medium">Est. stockout</th>
                    <th className="px-5 py-3 text-right font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7ECE8]">
                  {paginatedStockouts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-6 text-center text-sm text-[#68716C]">
                        No predicted stockouts.
                      </td>
                    </tr>
                  ) : (
                    paginatedStockouts.map((item) => {
                      const riskStyle = getRiskStyle(item.risk)
                      return (
                        <tr className="text-[#0c0d0d]" key={item.inventoryId}>
                          <td className="px-5 py-4">
                            <p className="font-medium capitalize">{item.product}</p>
                            <p className="mt-0.5 text-xs text-[#68716C] capitalize">{item.inventoryId} · {item.warehouse}</p>
                          </td>
                          <td className="px-4 py-4">{formatNumber(item.availableUnits)}</td>
                          <td className="px-4 py-4">{formatNumber(item.reorderPoint)}</td>
                          <td className="px-4 py-4 text-[#68716C]">{item.estimatedStockoutDate}</td>
                          <td className="px-5 py-4 text-right">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${riskStyle.className}`}>{riskStyle.label}</span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-[#E7ECE8] p-4 lg:flex-row lg:gap-0">
              <span className="text-sm text-[#737A76]">
                Showing {paginatedStockouts.length} of {predictedStockouts.length} predicted stockouts
              </span>

              <div className="flex">
                <PaginationDemo
                  currentPage={stockoutCurrentPage}
                  totalPages={stockoutTotalPages}
                  onPageChange={setStockoutCurrentPage}
                />
              </div>
            </div>
          </article>

          <div className="flex flex-col justify-between gap-4">
            <article className="flex flex-col rounded-2xl border border-[#DCE4DE] bg-white p-5 shadow-sm h-full">
              <div className="flex items-start justify-between">
                <p className="text-sm text-[#68716C]">Forecast risks</p>
                <span className="rounded-xl bg-[#FBE7E7] p-2 text-[#B42318]"><AlertTriangle className="h-5 w-5" /></span>
              </div>
              <p className="flex flex-1 mt-4 text-7xl font-semibold text-[#0c0d0d]">{forecastWarningCount}</p>
              <p className="mt-2 text-sm text-[#68716C]">products currently marked Critical</p>
            </article>

            <MovementVelocity items={movementVelocity} />
          </div>
        </section>

        <section id="RawMaterials" className="relative flex w-full scroll-mt-6 flex-col rounded-2xl p-4 shadow-sm lg:p-5 border border-[#DCE4DE]">
          <span id="Risks" className="absolute -top-6" aria-hidden="true" />
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-medium tracking-tight text-[#121514]">Inventory</h2>
              <span className="rounded-md border border-[#DFE2E0] px-3 py-1 text-sm text-[#121514]">{inventories.length}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
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

              <button
                className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-2 text-sm whitespace-nowrap transition-colors hover:bg-[#DCE4DF]"
                type="button"
                onClick={() =>
                  exportToCSV(
                    displayedInventories,
                    [
                      { header: 'Inventory ID', value: (item) => formatInventoryId(String(item.id)) },
                      { header: 'Product', value: (item) => item.name },
                      { header: 'Available', value: (item) => item.quantity },
                      { header: 'Reorder point', value: (item) => item.reorderPoint },
                      { header: 'Warehouse', value: (item) => item.warehouseName },
                      { header: 'Status', value: (item) => item.status },
                      { header: 'Date arrived', value: (item) => formatDate(item.dateArrived) },
                    ],
                    'inventory'
                  )
                }
              >
                Export to CSV
              </button>

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
                  <span className="ml-1">{filter.count}</span>
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
                      {loadError}
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
                              actions={editDeleteActions}
                              label={`More actions for inventory ${item.id}`}
                              onAction={() => {
                                setSelectedItem(item)
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
              Showing {paginatedInventories.length} of {filteredInventories.length} inventory items
            </span>

            <div className="flex">
              <PaginationDemo currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        </section>

        <WarehouseCapacitySection initialCapacity={warehouseCapacity} />
      </div>

      <SeeMoreModal open={isSeeMoreOpen} onClose={() => setIsSeeMoreOpen(false)} className="flex flex-col h-full lg:max-h-[70vh]">
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
          <div className="flex flex-col w-full h-fit mt-4 p-4 gap-4">
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

          <div className="flex flex-col w-full h-full p-4 mt-2">
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

            <div className="mt-4 flex w-full flex-col gap-2">
              {selectedTransactions.length === 0 ? (
                <div className="flex min-h-24 w-full items-center justify-center rounded-xl bg-[#F0F1F1] text-sm text-[#737A76]">
                  No movements found.
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 mt-8">
              <span className="text-xs uppercase text-[#121514]">Damaged inventory</span>
              <div className="border-b border-[#E2E2E2] flex w-full h-px" />
            </div>

            <div className="mt-4 flex w-full flex-col gap-2">
              {selectedDamagedRecords.length === 0 ? (
                <div className="flex min-h-24 w-full items-center justify-center rounded-xl bg-[#F0F1F1] text-sm text-[#737A76]">
                  No damage reports.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </SeeMoreModal>

      <AppModal
        className="flex max-h-[90vh] flex-col"
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
            <input
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => updateFormField('name', event.target.value)}
              value={form.name}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Quantity</span>
            <input
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
              emptyLabel="No products found."
              addHref="/dashboard/product"
              addLabel="Add product"
              isLoading={isLoadingProducts}
              onSearch={handleProductSearch}
              isSearching={isSearchingProducts}
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
            <span className="text-xs text-[#68716C]">Date arrived</span>
            <input
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => updateFormField('dateArrived', event.target.value)}
              type="date"
              value={form.dateArrived}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Reorder point</span>
            <input
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
    </main>
  )
}
