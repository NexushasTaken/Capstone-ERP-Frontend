import { ModalTitle } from "@/components/AppModal"
import CloseButton from "@/components/CloseButton"
import DetailItem from "@/components/DetailItem"
import SeeMoreModal from "@/components/SeeMoreModal"
import { formatDate, formatPeso } from "@/lib/format"
import {
  formatOrderNumber,
  normalizeOrderText,
  orderStatusClass,
  orderStatusDotClass,
} from "@/lib/helpers/orderHelpers"
import type { OrderGroup } from "@/types/order"

interface OrderDetailsModalProps {
  order: OrderGroup | null
  onClose: () => void
}

// The read-only "See more" view of an order.
export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  return (
    <SeeMoreModal open={order !== null} onClose={onClose} className="flex h-auto flex-col lg:max-h-[70vh] lg:max-w-3xl">
      <div className="flex w-full items-center justify-between gap-2 border-b border-border p-4">
        <div className="flex flex-col justify-between">
          <span className="text-xs">{order ? formatOrderNumber(order.orderId) : ""}</span>
          <ModalTitle className="text-xl font-medium text-foreground capitalize">{order?.customerName}</ModalTitle>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      {order ? <OrderDetailsBody order={order} /> : null}
    </SeeMoreModal>
  )
}

// Only the latest status change is stored. Processing is the starting status and can't be returned to,
// so it never has a change time.
function getStatusChangedLabel(status: string | null) {
  switch (normalizeOrderText(status).toLowerCase()) {
    case "shipped":
      return "Shipped at"
    case "completed":
      return "Completed at"
    case "cancelled":
      return "Cancelled at"
    default:
      return null
  }
}

function OrderDetailsBody({ order }: { order: OrderGroup }) {
  const statusLabel = normalizeOrderText(order.orderStatus)
  // Walk-in orders have no driver or addresses.
  const isWalkinOrder = normalizeOrderText(order.orderType).toLowerCase() === "walkin"
  const statusChangedLabel = getStatusChangedLabel(order.orderStatus)
  const totalQuantity = order.orders.reduce((sum, line) => sum + line.quantity, 0)

  return (
    <div className="flex w-full flex-col overflow-y-auto p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <DetailItem label="Order type" value={normalizeOrderText(order.orderType)} />
        <DetailItem
          label="Status"
          value={
            <span className={orderStatusClass(order.orderStatus)}>
              <span
                className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${orderStatusDotClass(order.orderStatus)}`}
              />
              {statusLabel}
            </span>
          }
        />
        {statusChangedLabel && order.updated_At ? (
          <DetailItem label={statusChangedLabel} value={formatDate(order.updated_At)} />
        ) : null}
        <DetailItem label="Created at" value={formatDate(order.created_At)} />
        <DetailItem label="Quantity" value={totalQuantity} />
        <DetailItem label="Total" value={formatPeso(order.total)} />
        {isWalkinOrder ? null : (
          <>
            <DetailItem label="Driver" value={order.driverName || "Unassigned"} />
            <DetailItem label="Pickup address" value={order.pickUpAddress ?? "-"} />
            <DetailItem label="Delivery address" value={order.deliveryAddress ?? "-"} />
          </>
        )}
      </div>

      <div className="mt-5 overflow-auto rounded-lg border border-border scrollbar-none">
        <div className="sticky top-0 grid grid-cols-[1fr_90px_110px_110px] bg-muted px-3 py-2 text-xs text-muted-foreground">
          <span>Product</span>
          <span>Quantity</span>
          <span>Amount</span>
          <span>Unit price</span>
        </div>
        {order.orders.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_90px_110px_110px] border-t border-border px-3 py-3 text-sm"
            key={`${order.orderId}-${index}`}
          >
            <span className="truncate capitalize">{item.productName}</span>
            <span className="font-medium">{item.quantity}</span>
            <span className="font-medium">{formatPeso(item.totalAmount)}</span>
            <span>{formatPeso(item.price)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
