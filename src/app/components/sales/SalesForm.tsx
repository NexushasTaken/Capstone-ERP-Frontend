import { ArrowDownUp, Ellipsis } from 'lucide-react'
import { formatPeso, formatSaleId, saleStatusDotClass } from '@/app/utils/saleHelpers'
import { mockSales, saleStatusFilters } from '@/app/utils/saleMockData'

const tableColumns = ['Sale ID', 'Product', 'Customer', 'Quantity', 'Total', 'Sale date', 'Status']

export default function SalesForm() {
  return (
    <section className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-[#121514]">Sales</h1>
          <span className="rounded-md border border-[#DFE2E0] px-3 py-1 text-sm text-[#121514]">6</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {saleStatusFilters.map((filter) => (
            <button
              className={`cursor-pointer rounded-xl border px-3 py-2 text-sm whitespace-nowrap ${
                filter.label === 'Paid'
                  ? 'border-[#121514] bg-[#121514] text-white'
                  : 'border-[#E1E4E2] bg-white text-[#121514]'
              }`}
              key={filter.label}
              type="button"
            >
              {filter.label} <span className="ml-1">{filter.count}</span>
            </button>
          ))}
          <button aria-label="Sort sales" className="cursor-pointer rounded-xl border border-[#E1E4E2] p-2 text-[#121514]" type="button">
            <ArrowDownUp size={18} />
          </button>
        </div>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-auto ">
        <table className="w-full min-w-240 border-separate border-spacing-y-2 text-left">
          <thead className="text-sm font-normal text-[#737A76]">
            <tr>
              {tableColumns.map((column) => (
                <th className="px-3 pb-1 font-normal" key={column} scope="col">
                  {column}
                </th>
              ))}
              <th aria-label="Sale actions" />
            </tr>
          </thead>
          <tbody>
            {mockSales.map((sale) => {
              const ProductIcon = sale.productIcon

              return (
                <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={sale.id}>
                  <td className="rounded-l-xl px-3 py-4 font-medium whitespace-nowrap">{formatSaleId(sale.id)}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2EF] text-[#425B49]">
                        <ProductIcon size={20} />
                      </span>
                      <span>
                        <span className="block font-medium">{sale.productName}</span>
                        <span className="block text-xs text-[#737A76]">{sale.sku}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 font-medium">{sale.customer}</td>
                  <td className="px-3 py-4 text-center">{sale.quantity}</td>
                  <td className="px-3 py-4 font-medium whitespace-nowrap">{formatPeso(sale.total)}</td>
                  <td className="px-3 py-4 font-medium whitespace-nowrap">{sale.saleDate}</td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${saleStatusDotClass(sale.status)}`} />
                    {sale.status}
                  </td>
                  <td className="rounded-r-xl px-3 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-1.5 text-sm whitespace-nowrap" type="button">
                        See more
                      </button>
                      <button aria-label={`More actions for sale ${sale.id}`} className="cursor-pointer rounded-xl border border-[#DFE2E0] p-1.5" type="button">
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
    </section>
  )
}
