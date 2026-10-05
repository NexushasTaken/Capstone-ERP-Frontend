import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
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
  columnCount: number
  isExpanded: boolean
  onExpandedChange: (expanded: boolean) => void
}

// One sale in the table; "View" expands it to show the details and its products.
export default function SaleRow({ sale, columnCount, isExpanded, onExpandedChange }: SaleRowProps) {
  const statusLabel = getSaleStatusLabel(sale)

  return (
    <Collapsible render={<TableBody />} open={isExpanded} onOpenChange={onExpandedChange}>
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
          <CollapsibleTrigger
            render={<Button size="sm" type="button" variant="outline" />}
            aria-label={"View " + formatSaleId(sale.id) + " details"}
          >
            View
            <ChevronDown className={"h-4 w-4 transition-transform " + (isExpanded ? "rotate-180" : "")} />
          </CollapsibleTrigger>
        </TableCell>
      </TableRow>
      {isExpanded ? (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={columnCount} className="p-0 whitespace-normal">
            <SaleDetails sale={sale} />
          </TableCell>
        </TableRow>
      ) : null}
    </Collapsible>
  )
}

function SaleDetails({ sale }: { sale: Sale }) {
  const details = [
    ["Customer", getSaleCustomerName(sale)],
    ["Order type", normalizeOrderText(sale.orderType)],
    ["Status", getSaleStatusLabel(sale)],
    ["Driver", sale.driverName || "Unassigned"],
    ["Pickup address", sale.pickUpAddress || "-"],
    ["Delivery address", sale.deliveryAddress || "-"],
    ["Sale date", formatDate(sale.created_At)],
    ["Quantity", getSaleQuantity(sale)],
    ["Total amount", formatPeso(sale.total)],
  ]

  return (
    <div className="border-t border-border bg-background p-4">
      <dl className="grid grid-cols-4 gap-4 text-sm">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="wrap-break-word font-medium text-foreground capitalize">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 max-h-80 overflow-auto rounded-lg border border-border scrollbar-none">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Sale products</caption>
          <thead className="sticky top-0 bg-muted text-xs text-muted-foreground">
            <tr>
              {["Product", "Quantity", "Unit price", "Amount"].map((column) => (
                <th key={column} scope="col" className="px-3 py-2 font-normal">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sale.orders.map((item, index) => (
              <tr key={`${sale.id}-${index}`} className="border-t border-border">
                <td className="px-3 py-3 capitalize">{item.productName}</td>
                <td className="px-3 py-3">{item.quantity}</td>
                <td className="whitespace-nowrap px-3 py-3">{formatPeso(item.price)}</td>
                <td className="whitespace-nowrap px-3 py-3 font-medium">{formatPeso(item.totalAmount)}</td>
              </tr>
            ))}
            {sale.orders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-3 text-muted-foreground">
                  No products recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
