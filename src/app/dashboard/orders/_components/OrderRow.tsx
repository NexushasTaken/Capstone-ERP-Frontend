import { ChevronDown } from 'lucide-react'
import StatusAction from '@/components/StatusAction'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import { TableBody, TableCell, TableRow } from '@/components/ui/table'
import { formatDate, formatPeso } from '@/lib/format'
import {
  formatOrderNumber,
  getOrderGroupProductSummary,
  normalizeOrderText,
  orderStatusClass,
  orderStatusDotClass,
} from '@/lib/helpers/orderHelpers'
import type { OrderGroup } from '@/types/order'
import DetailItem from './DetailItem'

interface OrderRowProps {
  order: OrderGroup
  columnCount: number
  statusOptions: { id: number; label: string }[]
  isExpanded: boolean
  onExpandedChange: (expanded: boolean) => void
  onChangeStatus: (orderStatusId: number) => void
}

export default function OrderRow({
  order,
  columnCount,
  statusOptions,
  isExpanded,
  onExpandedChange,
  onChangeStatus,
}: OrderRowProps) {
  const statusLabel = normalizeOrderText(order.orderStatus)
  const isWalkinOrder = normalizeOrderText(order.orderType).toLowerCase() === 'walkin'
  const isShippedOrder = statusLabel.toLowerCase() === 'shipped'
  // Walk-in orders can't be shipped, and shipped orders can't go back to processing.
  const statusActions = statusOptions
    .filter((status) => {
      const actionStatus = status.label.toLowerCase()
      return !((isWalkinOrder && actionStatus === 'shipped') || (isShippedOrder && actionStatus === 'processing'))
    })
    .map((status) => ({ label: status.label, value: String(status.id) }))

  return (
    <Collapsible render={<TableBody />} open={isExpanded} onOpenChange={onExpandedChange}>
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
            <CollapsibleTrigger render={<Button size="sm" type="button" variant="outline" />}>
              View
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            {statusLabel.trim().toLowerCase() !== 'cancelled' && (
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

      {isExpanded ? (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={columnCount} className="p-0 whitespace-normal">
            <OrderDetails order={order} />
          </TableCell>
        </TableRow>
      ) : null}
    </Collapsible>
  )
}

function OrderDetails({ order }: { order: OrderGroup }) {
  return (
    <div className="border-t border-border bg-background p-4">
      <div className="grid gap-4 grid-cols-4">
        <DetailItem label="Driver" value={order.driverName || 'Unassigned'} />
        <DetailItem label="Total" value={formatPeso(order.total)} />
        <DetailItem label="Created at" value={formatDate(order.created_At)} />
        <DetailItem label="Pickup address" value={order.pickUpAddress ?? '-'} />
        <DetailItem label="Delivery address" value={order.deliveryAddress ?? '-'} />
      </div>

      <div className="mt-5 rounded-lg border border-border overflow-auto max-h-80 scrollbar-none">
        <div className="sticky top-0 grid grid-cols-[1fr_120px_120px_140px_140px] bg-muted px-3 py-2 text-xs text-muted-foreground">
          <span>Product</span>
          <span>Quantity</span>
          <span>Amount</span>
          <span>Unit price</span>
        </div>
        {order.orders.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_120px_120px_140px_140px] border-t border-border px-3 py-3 text-sm"
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
