import { Undo2 } from "lucide-react"
import { ModalHeader } from "@/components/AppModal"
import DetailItem from "@/components/DetailItem"
import SeeMoreModal from "@/components/SeeMoreModal"
import { Button } from "@/components/ui/button"
import { formatDate, formatPeso } from "@/lib/format"
import { formatDiscount, normalizeOrderText } from "@/lib/helpers/orderHelpers"
import {
  canReturnSale,
  formatSaleId,
  getSaleCustomerName,
  getSaleQuantity,
  getSaleStatusLabel,
} from "@/lib/helpers/saleHelpers"
import type { Sale } from "@/types/sale"

interface SaleDetailsModalProps {
  sale: Sale | null
  onClose: () => void
  /** Shown as a "Return items" button when given and something is left to return. */
  onReturn?: (sale: Sale) => void
}

// The "See more" view of a sale; its only action is starting a return.
export default function SaleDetailsModal({ sale, onClose, onReturn }: SaleDetailsModalProps) {
  return (
    <SeeMoreModal open={sale !== null} onClose={onClose} className="flex h-auto flex-col lg:max-h-[70vh] lg:max-w-3xl">
      <ModalHeader title="Sale details" detail={sale ? formatSaleId(sale.id) : undefined} onClose={onClose} />

      {sale ? <SaleDetailsBody sale={sale} /> : null}

      {sale && onReturn && canReturnSale(sale) ? (
        <div className="flex justify-end border-t border-border p-4">
          <Button type="button" variant="outline" onClick={() => onReturn(sale)}>
            <Undo2 />
            Return items
          </Button>
        </div>
      ) : null}
    </SeeMoreModal>
  )
}

function SaleDetailsBody({ sale }: { sale: Sale }) {
  return (
    <div className="flex w-full flex-col overflow-y-auto p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <DetailItem label="Customer" value={<span className="capitalize">{getSaleCustomerName(sale)}</span>} />
        <DetailItem label="Order type" value={normalizeOrderText(sale.orderType)} />
        <DetailItem label="Status" value={getSaleStatusLabel(sale)} />
        <DetailItem label="Sale date" value={formatDate(sale.created_At)} />
        <DetailItem label="Quantity" value={getSaleQuantity(sale)} />
        <DetailItem label="Subtotal" value={formatPeso(sale.subtotal)} />
        <DetailItem
          label={`Discount (${formatDiscount(sale.discountType, sale.discountPercent)})`}
          value={sale.discountAmount > 0 ? `-${formatPeso(sale.discountAmount)}` : formatPeso(0)}
        />
        <DetailItem label="Total" value={formatPeso(sale.total)} />
        <DetailItem label="Refunded" value={sale.refunded > 0 ? `-${formatPeso(sale.refunded)}` : formatPeso(0)} />
        <DetailItem label="Total after refunds" value={formatPeso(sale.totalAfterRefunds)} />
        <DetailItem label="Driver" value={sale.driverName || "Unassigned"} />
        <DetailItem label="Delivery address" value={sale.deliveryAddress || "-"} />
      </div>

      <div className="mt-5 overflow-auto rounded-lg border border-border scrollbar-none">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Sale products</caption>
          <thead className="sticky top-0 bg-muted text-xs text-muted-foreground">
            <tr>
              {["Product", "Quantity", "Returned", "Unit price", "Amount"].map((column) => (
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
                <td className="px-3 py-3">{item.returnedQuantity}</td>
                <td className="whitespace-nowrap px-3 py-3">{formatPeso(item.price)}</td>
                <td className="whitespace-nowrap px-3 py-3 font-medium">{formatPeso(item.totalAmount)}</td>
              </tr>
            ))}
            {sale.orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-3 text-muted-foreground">
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
