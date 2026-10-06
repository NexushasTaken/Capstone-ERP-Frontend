import { ModalTitle } from "@/components/AppModal"
import CloseButton from "@/components/CloseButton"
import DetailItem from "@/components/DetailItem"
import SeeMoreModal from "@/components/SeeMoreModal"
import { formatDate, formatPeso } from "@/lib/format"
import { normalizeOrderText } from "@/lib/helpers/orderHelpers"
import { formatSaleId, getSaleCustomerName, getSaleQuantity, getSaleStatusLabel } from "@/lib/helpers/saleHelpers"
import type { Sale } from "@/types/sale"

interface SaleDetailsModalProps {
  sale: Sale | null
  onClose: () => void
}

// The read-only "See more" view of a sale.
export default function SaleDetailsModal({ sale, onClose }: SaleDetailsModalProps) {
  return (
    <SeeMoreModal open={sale !== null} onClose={onClose} className="flex h-auto flex-col lg:max-h-[70vh] lg:max-w-3xl">
      <div className="flex w-full items-center justify-between gap-2 border-b border-border p-4">
        <div className="flex flex-col justify-between">
          <span className="text-xs">{sale ? formatSaleId(sale.id) : ""}</span>
          <ModalTitle className="text-xl font-medium text-foreground capitalize">
            {sale ? getSaleCustomerName(sale) : ""}
          </ModalTitle>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      {sale ? <SaleDetailsBody sale={sale} /> : null}
    </SeeMoreModal>
  )
}

function SaleDetailsBody({ sale }: { sale: Sale }) {
  return (
    <div className="flex w-full flex-col overflow-y-auto p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <DetailItem label="Order type" value={normalizeOrderText(sale.orderType)} />
        <DetailItem label="Status" value={getSaleStatusLabel(sale)} />
        <DetailItem label="Sale date" value={formatDate(sale.created_At)} />
        <DetailItem label="Quantity" value={getSaleQuantity(sale)} />
        {sale.discountPercent > 0 && (
          <>
            <DetailItem label="Subtotal" value={formatPeso(sale.subtotal)} />
            <DetailItem label={`Discount (${sale.discountPercent}%)`} value={`-${formatPeso(sale.discountAmount)}`} />
          </>
        )}
        <DetailItem label="Total amount" value={formatPeso(sale.total)} />
        <DetailItem label="Driver" value={sale.driverName || "Unassigned"} />
        <DetailItem label="Pickup address" value={sale.pickUpAddress || "-"} />
        <DetailItem label="Delivery address" value={sale.deliveryAddress || "-"} />
      </div>

      <div className="mt-5 overflow-auto rounded-lg border border-border scrollbar-none">
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
