import { ChevronDown } from 'lucide-react'
import StatusAction from '@/components/StatusAction'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
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

// Shared with the header row in OrdersList so the columns line up.
export const orderGridColumns =
  'grid-cols-[120px_240px_140px_140px_200px_140px_140px_130px] lg:grid-cols-[120px_1.4fr_140px_140px_1fr_140px_140px_160px]'

interface OrderRowProps {
  order: OrderGroup
  statusOptions: { id: number; label: string }[]
  isExpanded: boolean
  onExpandedChange: (expanded: boolean) => void
  onChangeStatus: (orderStatusId: number) => void
}

export default function OrderRow({ order, statusOptions, isExpanded, onExpandedChange, onChangeStatus }: OrderRowProps) {
  const statusLabel = normalizeOrderText(order.orderStatus)
  const isWalkinOrder = normalizeOrderText(order.orderType).toLowerCase() === 'walkin'
  const isShippedOrder = statusLabel.toLowerCase() === 'shipped'
  // Walk-in orders can't be shipped, and shipped orders can't go back to processing.
  const statusActions = statusOptions
    .filter((status) => {
      const actionStatus = status.label.toLowerCase()
      return !(
        (isWalkinOrder && actionStatus === 'shipped') ||
        (isShippedOrder && actionStatus === 'processing')
      )
    })
    .map((status) => ({ label: status.label, value: String(status.id) }))

  return (
    <Collapsible
      className="rounded-xl bg-[#FAFBFA] text-sm text-[#121514]"
      open={isExpanded}
      onOpenChange={onExpandedChange}
    >
      <div className={`grid ${orderGridColumns} items-center px-3 py-5`}>
        <span className="font-medium">{formatOrderNumber(order.orderId)}</span>
        <span className="truncate capitalize">{getOrderGroupProductSummary(order)}</span>
        <span className="whitespace-nowrap capitalize">{normalizeOrderText(order.orderType)}</span>
        <span className={`font-medium whitespace-nowrap capitalize ${orderStatusClass(order.orderStatus)}`}>
          <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${orderStatusDotClass(order.orderStatus)}`} />
          {statusLabel}
        </span>
        <span className="truncate capitalize">{order.customerName}</span>
        <span className="whitespace-nowrap">{formatDate(order.created_At)}</span>
        <span className="font-medium whitespace-nowrap">{formatPeso(order.total)}</span>
        <div className="ml-auto flex items-center gap-2">
          <CollapsibleTrigger
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#DFE2E0] bg-white px-3 py-1.5 text-sm whitespace-nowrap transition-all hover:bg-[#DCE4DF]"
            type="button"
          >
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
      </div>

      {isExpanded ? <OrderDetails order={order} /> : null}
    </Collapsible>
  )
}

function OrderDetails({ order }: { order: OrderGroup }) {
  return (
    <div className="border-t border-[#E2E2E2] bg-white p-4">
      <div className="grid gap-4 grid-cols-4">
        <DetailItem label="Driver" value={order.driverName || 'Unassigned'} />
        <DetailItem label="Total" value={formatPeso(order.total)} />
        <DetailItem label="Created at" value={formatDate(order.created_At)} />
        <DetailItem label="Pickup address" value={order.pickUpAddress ?? '-'} />
        <DetailItem label="Delivery address" value={order.deliveryAddress ?? '-'} />
      </div>

      <div className="mt-5 rounded-lg border border-[#E2E2E2] overflow-auto max-h-80 scrollbar-none">
        <div className="sticky top-0 grid grid-cols-[1fr_120px_120px_140px_140px] bg-[#F0F1F1] px-3 py-2 text-xs text-[#737A76]">
          <span>Product</span>
          <span>Quantity</span>
          <span>Amount</span>
          <span>Unit price</span>
        </div>
        {order.orders.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_120px_120px_140px_140px] border-t border-[#E2E2E2] px-3 py-3 text-sm"
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
