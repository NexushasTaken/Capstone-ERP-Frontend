import Loading from '@/components/Loading'
import SaleRow from './SaleRow'
import type { Sale } from '@/types/sale'

const tableColumns = [
  'Sale ID',
  'Product',
  'Order type',
  'Customer',
  'Quantity',
  'Total amount',
  'Sale date',
  'Status',
  'Actions',
]

interface SalesTableProps {
  sales: Sale[]
  isLoading: boolean
  error: unknown
  expandedSaleId: number | null
  onExpandedSaleChange: (saleId: number | null) => void
}

export default function SalesTable({ sales, isLoading, error, expandedSaleId, onExpandedSaleChange }: SalesTableProps) {
  return (
    <table className="w-full min-w-220 border-separate border-spacing-y-2 text-left">
      <thead className="text-sm font-normal text-[#737A76]">
        <tr>
          {tableColumns.map((column) => (
            <th className="px-3 pb-1 font-normal" key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      {isLoading ? (
        <tbody><tr>
          <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
            <Loading />
          </td>
        </tr></tbody>
      ) : error ? (
        <tbody><tr>
          <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-red-500">
            {error instanceof Error ? error.message : 'Failed to load sales'}
          </td>
        </tr></tbody>
      ) : sales.length === 0 ? (
        <tbody><tr>
          <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
            No sales found.
          </td>
        </tr></tbody>
      ) : (
        sales.map((sale) => (
          <SaleRow
            key={sale.id}
            sale={sale}
            columnCount={tableColumns.length}
            isExpanded={expandedSaleId === sale.id}
            onExpandedChange={(open) => onExpandedSaleChange(open ? sale.id : null)}
          />
        ))
      )}
    </table>
  )
}
