import Loading from '@/components/Loading'
import { getOrderGroupKey, tableColumns } from '@/lib/helpers/orderHelpers'
import type { OrderGroup } from '@/types/order'
import OrderRow, { orderGridColumns } from './OrderRow'

interface OrdersListProps {
  orders: OrderGroup[]
  isLoading: boolean
  error: unknown
  statusOptions: { id: number; label: string }[]
  expandedOrderKey: string | null
  onExpandedOrderChange: (orderKey: string | null) => void
  onChangeStatus: (orderId: number, orderStatusId: number) => void
}

// Laid out with CSS grid rather than <table> so each order can expand in place.
export default function OrdersList({
  orders,
  isLoading,
  error,
  statusOptions,
  expandedOrderKey,
  onExpandedOrderChange,
  onChangeStatus,
}: OrdersListProps) {
  return (
    <div className="min-w-7xl">
      <div className={`grid ${orderGridColumns} px-3 pb-1 text-sm text-[#737A76]`}>
        {tableColumns.map((column) => (
          <span key={column}>{column}</span>
        ))}
        <span className="text-right">Action</span>
      </div>

      {isLoading ? (
        <div className="px-3 py-4 text-center text-sm text-[#737A76]">
          <Loading />
        </div>
      ) : error ? (
        <div className="px-3 py-4 text-center text-sm text-red-500">
          {error instanceof Error ? error.message : 'Failed to load orders'}
        </div>
      ) : orders.length === 0 ? (
        <div className="px-3 py-4 text-center text-sm text-[#737A76]">
          No orders found.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map((order) => {
            const orderKey = getOrderGroupKey(order)
            return (
              <OrderRow
                key={orderKey}
                order={order}
                statusOptions={statusOptions}
                isExpanded={expandedOrderKey === orderKey}
                onExpandedChange={(open) => onExpandedOrderChange(open ? orderKey : null)}
                onChangeStatus={(orderStatusId) => onChangeStatus(order.orderId, orderStatusId)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
