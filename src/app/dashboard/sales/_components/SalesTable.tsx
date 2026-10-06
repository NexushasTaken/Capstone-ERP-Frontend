import DataTable from "@/components/DataTable"
import SaleRow from "./SaleRow"
import type { Sale } from "@/types/sale"

const columns = [
  "Sale ID",
  "Product",
  "Order type",
  "Customer",
  "Quantity",
  "Total amount",
  "Sale date",
  "Status",
  "Actions",
]

interface SalesTableProps {
  sales: Sale[]
  isLoading: boolean
  error: unknown
  onSeeMore: (sale: Sale) => void
}

export default function SalesTable({ sales, isLoading, error, onSeeMore }: SalesTableProps) {
  return (
    <DataTable
      className="min-w-220"
      columns={columns}
      emptyMessage="No sales found."
      error={error}
      errorMessage="Failed to load sales"
      isEmpty={sales.length === 0}
      isLoading={isLoading}
    >
      {sales.map((sale) => (
        <SaleRow key={sale.id} sale={sale} onSeeMore={() => onSeeMore(sale)} />
      ))}
    </DataTable>
  )
}
