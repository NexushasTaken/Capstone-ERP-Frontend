import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatDate, formatPeso } from "@/lib/format"
import {
  formatSaleId,
  getSaleCustomerName,
  getSaleProductName,
  getSaleQuantity,
  getSaleStatusLabel,
  saleStatusDotClass,
} from "@/lib/helpers/saleHelpers"
import { normalizeOrderText } from "@/lib/helpers/orderHelpers"
import type { Sale } from "@/types/sale"

interface SaleRowProps {
  sale: Sale
  onSeeMore: () => void
}

// One sale in the table; "See more" opens its details.
export default function SaleRow({ sale, onSeeMore }: SaleRowProps) {
  const statusLabel = getSaleStatusLabel(sale)

  return (
    <TableRow>
      <TableCell className="px-3 py-4 font-medium">{formatSaleId(sale.id)}</TableCell>
      <TableCell className="px-3 py-4 font-medium capitalize">{getSaleProductName(sale)}</TableCell>
      <TableCell className="px-3 py-4 capitalize">{normalizeOrderText(sale.orderType)}</TableCell>
      <TableCell className="px-3 py-4 font-medium capitalize">{getSaleCustomerName(sale)}</TableCell>
      <TableCell className="px-3 py-4 text-center">{getSaleQuantity(sale)}</TableCell>
      <TableCell className="px-3 py-4 font-medium">{formatPeso(sale.total)}</TableCell>
      <TableCell className="px-3 py-4 font-medium">{formatDate(sale.created_At)}</TableCell>
      <TableCell className="px-3 py-4 capitalize">
        <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${saleStatusDotClass(statusLabel)}`} />
        {statusLabel}
      </TableCell>
      <TableCell className="px-3 py-4">
        <Button
          size="sm"
          type="button"
          variant="outline"
          onClick={onSeeMore}
          aria-label={"View " + formatSaleId(sale.id) + " details"}
        >
          See more
        </Button>
      </TableCell>
    </TableRow>
  )
}
