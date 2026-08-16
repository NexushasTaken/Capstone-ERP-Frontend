'use client'

import WarehouseCapacitySection from '@/app/components/inventory/WarehouseCapacitySection'
import MovementVelocity from '@/app/components/inventory/MovementVelocity'
import { inventoryDashboardData, mockRawMaterialMovements, mockRawMaterials, rawMaterialSortOptions } from '@/app/utils/inventoryMockData'
import { formatNumber, formatPeso, getRawMaterialStatusStyle, getRiskStyle } from '@/app/utils/inventoryHelpers'
import { exportToCSV } from '@/app/utils/exportToCsv'
import { RAW_MATERIAL_STATUSES, RawMaterialSortBy, type RawMaterialFilter, type RawMaterialStatusFilter } from '@/app/types/inventory'
import { AlertTriangle, PackageMinus, PackagePlus, Search, Shapes, SlidersHorizontal, Truck, X } from 'lucide-react'
import SeeMoreModal from '@/app/components/modals/SeeMoreModal'
import { useState } from 'react'
import CloseButton from '@/app/components/CloseButton'
import SortPopover from '@/app/components/SortPopover'
import { PaginationDemo } from '@/app/components/Pagination'
import StatusAction from '@/app/components/StatusAction'
import { editDeleteActions } from '@/app/utils/statusActionHelpers'


const rawMaterialColumns = ['Inventory ID', 'Product ID', 'Raw material', 'Available', 'Reorder point', 'Warehouse', 'Unit cost', 'Status']

export default function InventoryForm() {
  const { forecastWarningCount, warehouseCapacity, movementVelocity, predictedStockouts } = inventoryDashboardData

  const [isSeeMoreOpen, setIsSeeMoreOpen] = useState(false);
  const [sortBy, setSortBy] = useState<RawMaterialSortBy>('material')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedItem, setSelectedItem] =
    useState<(typeof mockRawMaterials)[number] | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<RawMaterialFilter>('All')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [stockoutCurrentPage, setStockoutCurrentPage] = useState(1)
  const itemsPerPage = 10
  const stockoutItemsPerPage = 10

  const rawMaterialStatusFilters: RawMaterialStatusFilter[] = [
    {
      label: 'All',
      count: mockRawMaterials.length,
    },
    ...RAW_MATERIAL_STATUSES.map((status) => ({
      label: status,
      count: mockRawMaterials.filter(
        (item) => item.status === status
      ).length,
    })),
  ]

  const filteredRawMaterials = mockRawMaterials.filter((item) => {
    const matchesFilter =
      selectedFilter === 'All' || item.status === selectedFilter

    const matchesSearch =
      search === '' ||
      item.material.toLowerCase().includes(search.toLowerCase()) ||
      item.warehouse.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const totalPages = Math.ceil(
    filteredRawMaterials.length / itemsPerPage
  )

  const displayedRawMaterials = [...filteredRawMaterials].sort((a, b) => {
    switch (sortBy) {
      case 'material':
        return sortOrder === 'asc'
          ? a.material.localeCompare(b.material)
          : b.material.localeCompare(a.material)

      case 'quantity':
        return sortOrder === 'asc'
          ? a.quantity - b.quantity
          : b.quantity - a.quantity

      case 'reorderPoint':
        return sortOrder === 'asc'
          ? a.reorderPoint - b.reorderPoint
          : b.reorderPoint - a.reorderPoint

      case 'unitCost':
        return sortOrder === 'asc'
          ? a.unitCost - b.unitCost
          : b.unitCost - a.unitCost

      case 'warehouse':
        return sortOrder === 'asc'
          ? a.warehouse.localeCompare(b.warehouse)
          : b.warehouse.localeCompare(a.warehouse)

      default:
        return 0
    }
  })

  const paginatedRawMaterials = displayedRawMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const stockoutTotalPages = Math.ceil(
    predictedStockouts.length / stockoutItemsPerPage
  )

  const paginatedStockouts = predictedStockouts.slice(
    (stockoutCurrentPage - 1) * stockoutItemsPerPage,
    stockoutCurrentPage * stockoutItemsPerPage
  )

  const selectedStatusStyle = selectedItem
    ? getRawMaterialStatusStyle(selectedItem.status)
    : null;

  // const percentage = selectedItem
  // ? Math.min((selectedItem.quantity / selectedItem.reorderPoint) * 100, 100)
  // : 0;

  const selectedMovements = selectedItem
    ? mockRawMaterialMovements.filter((movement) => movement.materialId === selectedItem.id)
    : []

  const getMovementStyle = (type: (typeof mockRawMaterialMovements)[number]['type']) => {
    switch (type) {
      case 'Stock in':
        return {
          Icon: PackagePlus,
          className: 'bg-[#EBF3ED] text-[#31723B]',
          quantityPrefix: '+',
        }
      case 'Stock out':
        return {
          Icon: PackageMinus,
          className: 'bg-[#FBE7E7] text-[#B42318]',
          quantityPrefix: '-',
        }
      case 'Adjustment':
        return {
          Icon: SlidersHorizontal,
          className: 'bg-[#F6EFE6] text-[#7A4E22]',
          quantityPrefix: '',
        }
    }
  }

  return (
    <main className="flex h-screen w-full p-6 lg:w-4/5 bg-white">
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
                <p className="mt-1 text-xs lg:text-sm text-[#68716C]">Raw materials projected to stock out within 30 days</p>
              </div>
              <span className="rounded-lg bg-[#FBE7E7] px-2.5 py-1 text-xs font-semibold text-[#B42318]">{forecastWarningCount} risks</span>
            </div>
            <div className="max-h-85 overflow-auto">
            <table className="w-full min-w-162.5 text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[#F7F9F7] text-xs uppercase tracking-wide text-[#68716C]">
                <tr>
                  <th className="px-5 py-3 font-medium">Material</th>
                  <th className="px-4 py-3 font-medium">Available</th>
                  <th className="px-4 py-3 font-medium">Reorder point</th>
                  <th className="px-4 py-3 font-medium">Stockout date</th>
                  <th className="px-5 py-3 text-right font-medium">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7ECE8]">
                {paginatedStockouts.map((item) => {
                  const riskStyle = getRiskStyle(item.risk)
                  return (
                    <tr className="text-[#0c0d0d]" key={item.sku}>
                      <td className="px-5 py-4"><p className="font-medium">{item.product}</p><p className="mt-0.5 text-xs text-[#68716C]">{item.sku} · {item.warehouse}</p></td>
                      <td className="px-4 py-4">{formatNumber(item.availableUnits)} {item.unit}</td>
                      <td className="px-4 py-4">{formatNumber(item.reorderPoint)} {item.unit}</td>
                      <td className="px-4 py-4 text-[#68716C]">{item.estimatedStockoutDate}</td>
                      <td className="px-5 py-4 text-right"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${riskStyle.className}`}>{riskStyle.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-[#E7ECE8] p-4 lg:flex-row lg:gap-0">
              <span className="text-sm text-[#737A76]">
                Showing {paginatedStockouts.length} of {predictedStockouts.length} predicted stockouts
              </span>

              <div className='flex'>
                <PaginationDemo
                  currentPage={stockoutCurrentPage}
                  totalPages={stockoutTotalPages}
                  onPageChange={setStockoutCurrentPage}
                />
              </div>
            </div>
          </article>

            <div className='flex flex-col justify-between gap-4'>
              <article className="flex flex-col rounded-2xl border border-[#DCE4DE] bg-white p-5 shadow-sm h-full">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-[#68716C]">Forecast risks</p>
                  <span className="rounded-xl bg-[#FBE7E7] p-2 text-[#B42318]"><AlertTriangle className="h-5 w-5" /></span>
                </div>
                <p className="flex flex-1 mt-4 text-7xl font-semibold text-[#0c0d0d]">{forecastWarningCount}</p>
                <p className="mt-2 text-sm text-[#68716C]">raw materials predicted to run out in the next 30 days</p>
              </article>
              
              <MovementVelocity items={movementVelocity} />
            </div>
        </section>

        <section id="RawMaterials" className="relative flex w-full scroll-mt-6 flex-col rounded-2xl p-4 shadow-sm lg:p-5 border border-[#DCE4DE]">
          <span id="Risks" className="absolute -top-6" aria-hidden="true" />
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-medium tracking-tight text-[#121514]">Raw materials</h2>
              <span className="rounded-md border border-[#DFE2E0] px-3 py-1 text-sm text-[#121514]">{mockRawMaterials.length}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* SEARCH INPUT */}
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Search raw materials"
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
                ): (
                  <Search className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-[#737A76]" />
                )}
                
              </div>
              {/* EXPORT TO CSV */}
              <button
                className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-2 text-sm whitespace-nowrap transition-colors hover:bg-[#DCE4DF]"
                type="button"
                onClick={() =>
                  exportToCSV(
                    displayedRawMaterials,
                    [
                      { header: 'Inventory ID', value: (item) => item.id },
                      { header: 'Raw material', value: (item) => item.material },
                      { header: 'Category', value: (item) => item.category },
                      { header: 'Available', value: (item) => `${item.quantity} ${item.unit}` },
                      { header: 'Reorder point', value: (item) => `${item.reorderPoint} ${item.unit}` },
                      { header: 'Warehouse', value: (item) => item.warehouse },
                      { header: 'Unit cost', value: (item) => item.unitCost },
                      { header: 'Status', value: (item) => item.status },
                    ],
                    'raw-materials'
                  )
                }
              >
                Export to CSV
              </button>
              {/* FILTERS */}
              {rawMaterialStatusFilters.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => setSelectedFilter(filter.label)}
                  className={`cursor-pointer rounded-xl border px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                    selectedFilter === filter.label
                      ? 'border-[#121514] bg-[#121514] text-white'
                      : 'border-[#E1E4E2] bg-white text-[#121514] hover:bg-[#DCE4DF]'
                  }`}
                >
                  {filter.label}
                  <span className="ml-1">{filter.count}</span>
                </button>
              ))}
              <SortPopover
                value={sortBy}
                order={sortOrder}
                options={rawMaterialSortOptions}
                onChange={(value, order) => {
                  setSortBy(value)
                  setSortOrder(order)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>

          <div className="mt-5 min-h-0 overflow-auto">
            <table className="w-full min-w-250 border-separate border-spacing-y-2 text-left">
              <thead className="text-sm font-normal text-[#737A76]">
                <tr>
                  {rawMaterialColumns.map((column) => (
                    <th className="px-3 pb-1 font-normal" key={column} scope="col">
                      {column}
                    </th>
                  ))}
                  <th aria-label="Raw material actions" />
                </tr>
              </thead>
              <tbody>
                {paginatedRawMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={rawMaterialColumns.length + 1} className="px-3 py-4 text-center text-sm text-[#737A76]">
                      No raw materials found.
                    </td>
                  </tr>
                ) : 
                  paginatedRawMaterials.map((item) => {
                    const statusStyle = getRawMaterialStatusStyle(item.status)

                  return (
                    <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={item.id}>
                      <td className="rounded-l-xl px-3 py-4 font-medium whitespace-nowrap">{item.id}</td>
                      <td className="rounded-l-xl px-3 py-4 font-medium whitespace-nowrap">{item.productId}</td>
                      <td className="px-3 py-4">
                        <span className="block font-medium">{item.material}</span>
                        <span className="block text-xs text-[#737A76]">{item.category}</span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">{formatNumber(item.quantity)} {item.unit}</td>
                      <td className="px-3 py-4 whitespace-nowrap">{formatNumber(item.reorderPoint)} {item.unit}</td>
                      <td className="px-3 py-4 font-medium whitespace-nowrap">{item.warehouse}</td>
                      <td className="px-3 py-4 font-medium whitespace-nowrap">{formatPeso(item.unitCost)}</td>
                      <td className={`px-3 py-4 font-medium whitespace-nowrap ${statusStyle.labelClassName}`}>
                        <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${statusStyle.dotClassName}`} />
                        {item.status}
                      </td>
                      <td className="rounded-r-xl px-3 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-1.5 text-sm whitespace-nowrap transition-all hover:bg-[#DCE4DF]" type="button" onClick={() => {
                            setSelectedItem(item);
                            setIsSeeMoreOpen(true);
                            }}>
                            See more
                          </button>
                          <StatusAction
                            actions={editDeleteActions}
                            label={`More actions for material ${item.id}`}
                            onAction={() => {
                              setSelectedItem(item)
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 w-full justify-between items-center">
            <span className="text-sm text-[#737A76]">
              Showing {paginatedRawMaterials.length} of {filteredRawMaterials.length} raw materials
            </span>

            <div className='flex'>
              <PaginationDemo 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </section>

        <WarehouseCapacitySection initialCapacity={warehouseCapacity} />
      </div>

      <SeeMoreModal open={isSeeMoreOpen} onClose={() => setIsSeeMoreOpen(false)} className='flex flex-col h-full lg:max-h-[70vh]'>
        <div className='flex gap-2 w-full border-b border-[#E2E2E2] p-4 justify-between items-center'>
          <div className='flex flex-col justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-xs'>{selectedItem?.id}</span>

              {selectedStatusStyle && (
                <span className={`text-sm font-medium inline-flex items-center gap-1 ${selectedStatusStyle.labelClassName}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${selectedStatusStyle.dotClassName}`}/>
                  {selectedItem?.status}
                </span>
              )}

            </div>
            <span className='text-xl font-medium text-[#0c0d0d]'>{selectedItem?.material}</span>
          </div>
          <CloseButton onClick={() => setIsSeeMoreOpen(false)}/>
        </div> 

        <div className='flex flex-col w-full h-full overflow-y-auto'>
          <div className='flex flex-col w-full h-fit mt-4 p-4 gap-4'>
              <div className='grid grid-cols-2 w-full gap-4'>
                <div className='flex items-center px-3 w-full gap-2 h-16 rounded-lg bg-[#F0F1F1]'>
                  <span className='flex shrink-0 items-center justify-center w-10 h-10 rounded-xl bg-[#1B1C1C]'>
                    <Shapes className='text-[#777777] w-6 h-6'/>
                  </span>
                  <div className='flex flex-col'>
                    <span className='text-xs'>Category</span>
                    <span className='text-base font-semibold'>{selectedItem?.category}</span>
                  </div>
                </div>

              <div className='flex items-center px-3 w-full gap-2 h-16 rounded-lg bg-[#F0F1F1]'>
                <span className='flex shrink-0 items-center justify-center w-10 h-10 rounded-xl bg-[#1B1C1C]'>
                  <Truck className='text-[#777777] w-6 h-6'/>
                </span>
                <div className='flex flex-col'>
                  <span className='text-xs'>Warehouse</span>
                  <span className='text-base font-semibold'>{selectedItem?.warehouse}</span>
                </div>
              </div>
              </div>
          </div>

          <div className='flex flex-col w-full h-full p-4 mt-2'>
            <div className='flex flex-col gap-2'>
              <span className='text-xs uppercase'>Inventory Status</span>
              <div className='border-b border-[#E2E2E2] flex w-full h-px'/>
            </div>

            <div className='flex flex-col w-full h-40 bg-[#F0F1F1] mt-4 rounded-xl p-4'>
              <div className='flex w-full justify-between items-center h-full'>
                <div className='flex flex-col'>
                <span className='text-5xl font-semibold text-[#0c0d0d]'>
                  {selectedItem?.quantity}
                </span>
                <span className='text-base font-light'>{selectedItem?.material} available</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-[#0c0d0d] text-2xl font-medium'>
                    <span>&#8369;</span>
                    <span>{selectedItem?.unitCost}</span>
                  </span>
                  <span className='font-light text-[#0c0d0d]'>Unit Cost</span>
                </div>
              </div>
              
              {/* <div className='flex flex-col w-full h-full mt-4'>
                <div className='flex w-full justify-between text-sm text-[#0c0d0d] mb-2'>
                  <span>Current Level</span>
                  <span>Reorder Point: {selectedItem?.reorderPoint}</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percentage}
                  className="h-3 w-full overflow-hidden rounded-full bg-[#E6EAE7]"
                >
                  <div
                    className="h-full rounded-full bg-black transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div> */}
            </div>

            <div className='flex flex-col gap-2 mt-8'>
              <div className='flex w-full justify-between'>
                <span className='text-xs uppercase text-[#121514]'>Recent Movements</span>
                <button aria-label='View All' type='button' className='text-xs uppercase text-[#5E5E5E] cursor-pointer transition-all hover:text-[#000000]'>View All</button>
              </div>
              <div className='border-b border-[#E2E2E2] flex w-full h-px'/>
            </div>

            <div className='mt-4 flex w-full flex-col gap-2'>
              {selectedMovements.length === 0 ? (
                <div className='flex min-h-24 w-full items-center justify-center rounded-xl bg-[#F0F1F1] text-sm text-[#737A76]'>
                  No movements found.
                </div>
              ) : (
                selectedMovements.map((movement) => {
                  const movementStyle = getMovementStyle(movement.type)
                  const MovementIcon = movementStyle.Icon

                  return (
                    <div key={movement.id} className='flex items-center gap-3 rounded-xl border border-[#E2E2E2] bg-white p-3'>
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${movementStyle.className}`}>
                        <MovementIcon className='h-5 w-5' />
                      </span>

                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center justify-between gap-3'>
                          <span className='truncate text-sm font-medium text-[#0c0d0d]'>{movement.type}</span>
                          <span className='shrink-0 text-sm font-semibold text-[#0c0d0d]'>
                            {movementStyle.quantityPrefix}{formatNumber(movement.quantity)} {movement.unit}
                          </span>
                        </div>

                        <div className='mt-1 flex items-center justify-between gap-3 text-xs text-[#737A76]'>
                          <span className='truncate'>{movement.reference} by {movement.handledBy}</span>
                          <span className='shrink-0'>{movement.date}</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </SeeMoreModal>
    </main>
  )
}
