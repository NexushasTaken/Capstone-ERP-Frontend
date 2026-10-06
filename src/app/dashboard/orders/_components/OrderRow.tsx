import StatusAction from "@/components/StatusAction"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatDate, formatPeso } from "@/lib/format"
import {
  formatOrderNumber,
  getOrderGroupProductSummary,
  normalizeOrderText,
  orderStatusClass,
  orderStatusDotClass,
} from "@/lib/helpers/orderHelpers"
import type { OrderGroup } from "@/types/order"

interface OrderRowProps {
  order: OrderGroup
  statusOptions: { id: number; label: string }[]
  onSeeMore: () => void
  onChangeStatus: (orderStatusId: number) => void
}

export default function OrderRow({ order, statusOptions, onSeeMore, onChangeStatus }: OrderRowProps) {
  const statusLabel = normalizeOrderText(order.orderStatus)
  const isWalkinOrder = normalizeOrderText(order.orderType).toLowerCase() === "walkin"
  const isShippedOrder = statusLabel.toLowerCase() === "shipped"
  // Walk-in orders can't be shipped, and shipped orders can't go back to processing.
  const statusActions = statusOptions
    .filter((status) => {
      const actionStatus = status.label.toLowerCase()
      return !((isWalkinOrder && actionStatus === "shipped") || (isShippedOrder && actionStatus === "processing"))
    })
    .map((status) => ({ label: status.label, value: String(status.id) }))

  return (
    <TableRow>
      <TableCell className="px-3 py-4 font-medium">{formatOrderNumber(order.orderId)}</TableCell>
      <TableCell className="max-w-72 truncate px-3 py-4 capitalize">{getOrderGroupProductSummary(order)}</TableCell>
      <TableCell className="px-3 py-4 capitalize">{normalizeOrderText(order.orderType)}</TableCell>
      <TableCell className={`px-3 py-4 font-medium capitalize ${orderStatusClass(order.orderStatus)}`}>
        <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${orderStatusDotClass(order.orderStatus)}`} />
        {statusLabel}
      </TableCell>
      <TableCell className="max-w-56 truncate px-3 py-4 capitalize">{order.customerName}</TableCell>
      <TableCell className="px-3 py-4">{formatDate(order.created_At)}</TableCell>
      <TableCell className="px-3 py-4 font-medium">{formatPeso(order.total)}</TableCell>
      <TableCell className="px-3 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" type="button" variant="outline" onClick={onSeeMore}>
            See more
          </Button>
          {statusLabel.trim().toLowerCase() !== "cancelled" && (
            <StatusAction
              actions={statusActions}
              label="Order actions"
              onAction={(statusId) => {
                if (statusId) onChangeStatus(Number(statusId))
              }}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
