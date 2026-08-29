'use client'

import { ArrowDownUp, Search, X } from 'lucide-react'
import {
  formatPeso,
  formatSaleId,
  formatDate,
  getSaleProductName,
  getSaleCustomerName,
  getSaleQuantity,
  getSaleStatusLabel,
  saleStatusDotClass,
} from '@/app/utils/helpers/saleHelpers'
import { formatOrderId } from '@/app/utils/helpers/orderHelpers'
import { mockSales } from '@/app/utils/mock/saleMockData'
import { exportToCSV } from '@/app/utils/exportToCsv'
import { useState } from 'react'

const tableColumns = [
  'Sale ID',
  'Order ID',
  'Product',
  'Customer',
  'Quantity',
  'Total amount',
  'Sale date',
  'Status',
  'Active',
]

export default function SalesForm() {
  const [search, setSearch] = useState('')

  const filteredSales = mockSales.filter((sale) => {
    const searchValue = search.toLowerCase()
    const productName = getSaleProductName(sale)
    const customerName = getSaleCustomerName(sale)
    const statusLabel = getSaleStatusLabel(sale)

    return (
      search === '' ||
      sale.id.toLowerCase().includes(searchValue) ||
      sale.orderId.toLowerCase().includes(searchValue) ||
      productName.toLowerCase().includes(searchValue) ||
      customerName.toLowerCase().includes(searchValue) ||
      statusLabel.toLowerCase().includes(searchValue)
    )
  })

  return (
    <section className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-[#121514]">Sales</h1>
          <span className="rounded-md border border-[#DFE2E0] px-3 py-1 text-sm text-[#121514]">
            {mockSales.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sales"
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
                filteredSales,
                [
                  { header: 'Sale ID', value: (sale) => formatSaleId(sale.id) },
                  { header: 'Order ID', value: (sale) => formatOrderId(sale.orderId) },
                  { header: 'Product', value: (sale) => getSaleProductName(sale) },
                  { header: 'Customer', value: (sale) => getSaleCustomerName(sale) },
                  { header: 'Quantity', value: (sale) => getSaleQuantity(sale) },
                  { header: 'Total amount', value: (sale) => sale.totalAmount },
                  { header: 'Sale date', value: (sale) => formatDate(sale.createdAt) },
                  { header: 'Status', value: (sale) => getSaleStatusLabel(sale) },
                  { header: 'Active', value: (sale) => (sale.isActive ? 'Active' : 'Inactive') },
                ],
                'sales'
              )
            }
          >
            Export to CSV
          </button>
          <button aria-label="Sort sales" className="cursor-pointer rounded-xl border border-[#E1E4E2] p-2 text-[#121514]" type="button">
            <ArrowDownUp size={18} />
          </button>
        </div>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-240 border-separate border-spacing-y-2 text-left">
          <thead className="text-sm font-normal text-[#737A76]">
            <tr>
              {tableColumns.map((column) => (
                <th className="px-3 pb-1 font-normal" key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
                  No sales found.
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => {
                const productName = getSaleProductName(sale)
                const customerName = getSaleCustomerName(sale)
                const quantity = getSaleQuantity(sale)
                const statusLabel = getSaleStatusLabel(sale)

                return (
                  <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={sale.id}>
                    <td className="rounded-l-xl px-3 py-4 font-medium whitespace-nowrap">{formatSaleId(sale.id)}</td>
                    <td className="px-3 py-4 whitespace-nowrap">{formatOrderId(sale.orderId)}</td>
                    <td className="px-3 py-4 font-medium whitespace-nowrap">{productName}</td>
                    <td className="px-3 py-4 font-medium whitespace-nowrap">{customerName}</td>
                    <td className="px-3 py-4 text-center">{quantity}</td>
                    <td className="px-3 py-4 font-medium whitespace-nowrap">{formatPeso(sale.totalAmount)}</td>
                    <td className="px-3 py-4 font-medium whitespace-nowrap">{formatDate(sale.createdAt)}</td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${saleStatusDotClass(statusLabel)}`} />
                      {statusLabel}
                    </td>
                    <td className="rounded-r-xl px-3 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                          sale.isActive ? 'bg-[#EBF3ED] text-[#1F7A1F]' : 'bg-[#F5EAEA] text-[#B42318]'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${sale.isActive ? 'bg-[#39B82C]' : 'bg-[#D92D20]'}`} />
                        {sale.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex w-full justify-between gap-2">
        <span className="text-sm text-[#737A76]">
          Showing {filteredSales.length} of {mockSales.length} sales
        </span>
      </div>
    </section>
  )
}