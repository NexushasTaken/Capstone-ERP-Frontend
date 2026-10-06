import { TableCell, TableRow } from "@/components/ui/table"
import { formatPeso } from "@/lib/format"
import { getOrderDiscountAmount } from "@/lib/helpers/orderHelpers"

interface OrderTotalRowsProps {
  /** Sum of the line subtotals, before the discount. */
  subtotal: number
  discountPercent?: number
  /** Columns the label cell spans. */
  labelColSpan: number
  /** Extra empty cells to line the amount up with the table's columns. */
  trailingCells?: number
}

// Footer rows for an order's items table: Subtotal and Discount (only when there is one), then the net Total.
export default function OrderTotalRows({
  subtotal,
  discountPercent,
  labelColSpan,
  trailingCells = 0,
}: OrderTotalRowsProps) {
  const discountAmount = getOrderDiscountAmount(subtotal, discountPercent)
  const hasDiscount = discountAmount > 0
  const trailing = Array.from({ length: trailingCells }, (_, index) => <TableCell key={index} />)

  return (
    <>
      {hasDiscount && (
        <>
          <TableRow className="hover:bg-transparent">
            <TableCell className="text-right text-sm uppercase text-muted-foreground" colSpan={labelColSpan}>
              Subtotal
            </TableCell>
            <TableCell className="text-center text-foreground">{formatPeso(subtotal)}</TableCell>
            {trailing}
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableCell className="text-right text-sm uppercase text-muted-foreground" colSpan={labelColSpan}>
              Discount ({discountPercent}%)
            </TableCell>
            <TableCell className="text-center text-destructive">-{formatPeso(discountAmount)}</TableCell>
            {trailing}
          </TableRow>
        </>
      )}
      <TableRow className="hover:bg-transparent">
        <TableCell className="text-right text-sm font-semibold uppercase text-foreground" colSpan={labelColSpan}>
          Total
        </TableCell>
        <TableCell className="text-center text-base font-medium text-green-700">
          {formatPeso(subtotal - discountAmount)}
        </TableCell>
        {trailing}
      </TableRow>
    </>
  )
}
