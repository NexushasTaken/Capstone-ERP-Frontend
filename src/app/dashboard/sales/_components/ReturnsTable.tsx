import DataTable, { type DataTableColumn } from "@/components/DataTable"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatDate, formatPeso, formatQuantity } from "@/lib/format"
import { formatSaleId } from "@/lib/helpers/saleHelpers"
import type { SaleReturn } from "@/types/sale"

const columns: DataTableColumn[] = [
  "Return date",
  "Sale ID",
  "Product",
  "Customer",
  "Quantity",
  "Condition",
  "Refunded",
  "Reason",
  "Processed by",
]

interface ReturnsTableProps {
  returns: SaleReturn[]
  isLoading: boolean
  error: unknown
}

export default function ReturnsTable({ returns, isLoading, error }: ReturnsTableProps) {
  return (
    <DataTable
      className="min-w-260"
      columns={columns}
      emptyMessage="No returns found."
      error={error}
      errorMessage="Failed to load returns"
      isEmpty={returns.length === 0}
      isLoading={isLoading}
    >
      {returns.map((item) => (
        <TableRow key={item.id}>
          <TableCell className="px-3 py-4 font-medium">{formatDate(item.created_At)}</TableCell>
          <TableCell className="px-3 py-4 font-medium">{formatSaleId(item.saleId)}</TableCell>
          <TableCell className="px-3 py-4 capitalize">{item.productName}</TableCell>
          <TableCell className="px-3 py-4 capitalize">{item.customerName}</TableCell>
          <TableCell className="whitespace-nowrap px-3 py-4 text-center">
            {formatQuantity(item.quantity, item.unit)}
          </TableCell>
          <TableCell
            className={item.condition === "damaged" ? "px-3 py-4 text-destructive" : "px-3 py-4 text-green-700"}
          >
            {item.condition === "damaged" ? "Damaged" : "Good"}
          </TableCell>
          <TableCell className="px-3 py-4 font-medium">{formatPeso(item.refund)}</TableCell>
          <TableCell className="max-w-64 truncate px-3 py-4" title={item.reason}>
            {item.reason}
          </TableCell>
          <TableCell className="px-3 py-4 capitalize">{item.processedBy?.trim() || "-"}</TableCell>
        </TableRow>
      ))}
    </DataTable>
  )
}
