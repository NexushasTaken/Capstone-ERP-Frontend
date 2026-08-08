'use client'

import WarehouseCapacityChart from '@/app/components/inventory/WarehouseCapacityChart'
import MovementVelocity from '@/app/components/inventory/MovementVelocity'
import { inventoryDashboardData, mockRawMaterials } from '@/app/utils/inventoryMockData'
import { formatNumber, formatPeso, getRawMaterialStatusStyle, getRiskStyle } from '@/app/utils/inventoryHelpers'
import { RAW_MATERIAL_STATUSES, RawMaterialSortBy, type RawMaterialFilter, type RawMaterialStatusFilter } from '@/app/types/inventory'
import { AlertTriangle, Ellipsis, Search, Shapes, Truck, Warehouse, X } from 'lucide-react'
import SeeMoreModal from '@/app/components/modals/SeeMoreModal'
import { useState } from 'react'
import CloseButton from '@/app/components/CloseButton'
import SortPopover from '@/app/components/inventory/SortPopover'


const rawMaterialColumns = ['Material ID', 'Raw material', 'Used for', 'Available', 'Reorder point', 'Supplier', 'Unit cost', 'Status']

export default function InventoryForm() {
  const { health, forecastWarningCount, warehouseCapacity, movementVelocity, predictedStockouts } = inventoryDashboardData
  const healthStyle = getRiskStyle(health.status)

  const [isSeeMoreOpen, setIsSeeMoreOpen] = useState(false);
  const [sortBy, setSortBy] = useState<RawMaterialSortBy>('material')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedItem, setSelectedItem] =
    useState<(typeof mockRawMaterials)[number] | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<RawMaterialFilter>('All')
  const [search, setSearch] = useState('')

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

  const selectedStatusStyle = selectedItem
    ? getRawMaterialStatusStyle(selectedItem.status)
    : null;

  const percentage = selectedItem
  ? Math.min((selectedItem.quantity / selectedItem.reorderPoint) * 100, 100)
  : 0;

  return (
    <main className="flex h-screen w-full p-6 lg:w-4/5 bg-white">
      <div className="flex w-full flex-col gap-5 flex-1 min-h-0 overflow-y-auto scrollbar-none">
        <header>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#0c0d0d]">Inventory</h1>
          <p className="mt-2 text-sm text-[#68716C]">Forecast inventory health and act on upcoming stockouts.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 columns-1">
          <article className="flex flex-col rounded-2xl border border-[#DCE4DE] bg-white p-5 shadow-sm xl:col-span-1">
            <div className="flex flex-1 items-start justify-between gap-3">
              <div>
                <p className="text-sm text-[#68716C]">Inventory health</p>
                <p className="mt-8 text-7xl font-semibold text-[#0c0d0d]">{health.score}<span className="text-4xl text-[#909994]">/100</span></p>
              </div>
              <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${healthStyle.className}`}>{healthStyle.label}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#68716C]">{health.summary}</p>
          </article>

          <article className="flex flex-col rounded-2xl border border-[#DCE4DE] bg-white p-5 shadow-sm xl:col-span-1">
            <div className="flex items-start justify-between">
              <p className="text-sm text-[#68716C]">Forecast risks</p>
              <span className="rounded-xl bg-[#FBE7E7] p-2 text-[#B42318]"><AlertTriangle className="h-5 w-5" /></span>
            </div>
            <p className="flex flex-1 mt-4 text-7xl font-semibold text-[#0c0d0d]">{forecastWarningCount}</p>
            <p className="mt-2 text-sm text-[#68716C]">products predicted to run out in the next 30 days</p>
          </article>

          <div className="max-w-2xl">
            <MovementVelocity items={movementVelocity} />
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-5">
          <article className="flex flex-col min-h-85 rounded-2xl border border-[#DCE4DE] bg-white p-5 shadow-sm xl:col-span-2">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-[#EBF3ED] p-2 text-[#0c0d0d]"><Warehouse className="h-5 w-5" /></span>
              <div>
                <h2 className="font-semibold text-[#0c0d0d]">Warehouse capacity</h2>
                <p className="text-sm text-[#68716C]">{warehouseCapacity.warehouse}</p>
              </div>
            </div>
            <div className="flex flex-1 justify-center"><WarehouseCapacityChart capacity={warehouseCapacity} /></div>
          </article>

          <article className="min-h-85 overflow-hidden rounded-2xl border border-[#DCE4DE] bg-white shadow-sm xl:col-span-3">
            <div className="flex items-center justify-between border-b border-[#E7ECE8] p-5">
              <div>
                <h2 className="font-semibold text-[#0c0d0d]">Predicted stockouts</h2>
                <p className="mt-1 text-sm text-[#68716C]">Products projected to stock out within 30 days</p>
              </div>
              <span className="rounded-lg bg-[#FBE7E7] px-2.5 py-1 text-xs font-semibold text-[#B42318]">{forecastWarningCount} risks</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-162.5 text-left text-sm">
                <thead className="bg-[#F7F9F7] text-xs uppercase tracking-wide text-[#68716C]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Available</th>
                    <th className="px-4 py-3 font-medium">Stockout date</th>
                    <th className="px-5 py-3 text-right font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7ECE8]">
                  {predictedStockouts.map((item) => {
                    const riskStyle = getRiskStyle(item.risk)
                    return (
                      <tr className="text-[#0c0d0d]" key={item.sku}>
                        <td className="px-5 py-4"><p className="font-medium">{item.product}</p><p className="mt-0.5 text-xs text-[#68716C]">{item.sku} · {item.warehouse}</p></td>
                        <td className="px-4 py-4">{item.availableUnits} units</td>
                        <td className="px-4 py-4 text-[#68716C]">{item.estimatedStockoutDate}</td>
                        <td className="px-5 py-4 text-right"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${riskStyle.className}`}>{riskStyle.label}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <section className="flex w-full flex-col rounded-2xl p-4 shadow-sm lg:p-5 border border-[#DCE4DE]">
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
                  onChange={(e) => setSearch(e.target.value)}
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
              <button className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-2 text-sm whitespace-nowrap transition-colors hover:bg-[#DCE4DF]" type="button">
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
                onChange={(value, order) => {
                  setSortBy(value)
                  setSortOrder(order)
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
                {displayedRawMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={rawMaterialColumns.length + 1} className="px-3 py-4 text-center text-sm text-[#737A76]">
                      No raw materials found.
                    </td>
                  </tr>
                ) : 
                  displayedRawMaterials.map((item) => {
                    const statusStyle = getRawMaterialStatusStyle(item.status)

                  return (
                    <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={item.id}>
                      <td className="rounded-l-xl px-3 py-4 font-medium whitespace-nowrap">{item.id}</td>
                      <td className="px-3 py-4">
                        <span className="block font-medium">{item.material}</span>
                        <span className="block text-xs text-[#737A76]">{item.category}</span>
                      </td>
                      <td className="px-3 py-4 font-medium whitespace-nowrap">{item.usedFor}</td>
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
                          <button aria-label={`More actions for material ${item.id}`} className="cursor-pointer rounded-xl border border-[#DFE2E0] p-1.5" type="button">
                            <Ellipsis size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex w-full justify-between gap-2">
            <span className="text-sm text-[#737A76]">
              Showing {displayedRawMaterials.length} of {filteredRawMaterials.length} raw materials
            </span>
          </div>
        </section>
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
                  <span className='flex items-center justify-center w-10 h-10 rounded-xl bg-[#DCE4DF]'>
                    <Shapes className='text-[#8A938E] w-6 h-6'/>
                  </span>
                  <div className='flex flex-col'>
                    <span className='text-xs'>Used For</span>
                    <span className='text-base font-semibold'>{selectedItem?.usedFor}</span>
                  </div>
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

          <div className='flex flex-col w-full h-full p-4 mt-2'>
            <div className='flex flex-col gap-2'>
              <span className='text-xs uppercase'>Inventory Status</span>
              <div className='border-b border-[#E2E2E2] flex w-full h-px'/>
            </div>

            <div className='flex flex-col w-full h-40 bg-[#F0F1F1] mt-4 rounded-xl p-4'>
              <div className='flex w-full justify-between items-end'>
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
              
              <div className='flex flex-col w-full h-full mt-4'>
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
              </div>
            </div>

            <div className='flex flex-col gap-2 mt-8'>
              <div className='flex w-full justify-between'>
                <span className='text-xs uppercase text-[#121514]'>Recent Movements</span>
                <button aria-label='View All' type='button' className='text-xs uppercase text-[#5E5E5E] cursor-pointer transition-all hover:text-[#000000]'>View All</button>
              </div>
              <div className='border-b border-[#E2E2E2] flex w-full h-px'/>
            </div>

            <div className='flex w-full h-full bg-[#DCE4DF]'>
              {/* put here the inventory movements, all raw materials */}
            </div>
          </div>
        </div>
      </SeeMoreModal>
    </main>
  )
}
