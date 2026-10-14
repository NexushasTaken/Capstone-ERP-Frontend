import DataTable, { type DataTableColumn } from "@/components/DataTable"
import { getOrderGroupKey } from "@/lib/helpers/orderHelpers"
import type { OrderGroup } from "@/types/order"
import OrderRow from "./OrderRow"

const columns: DataTableColumn[] = [
  "Order ID",
  "Product",
  "Order Type",
  "Order Status",
  "Customer",
  "Order Date",
  "Amount",
  { label: "Action", className: "text-right", srOnly: true },
]

interface OrdersListProps {
  orders: OrderGroup[]
  isLoading: boolean
  error: unknown
  statusOptions: { id: number; label: string }[]
  onSeeMore: (order: OrderGroup) => void
  onEdit: (order: OrderGroup) => void
  onChangeStatus: (orderId: number, orderStatusId: number) => void
}

export default function OrdersList({
  orders,
  isLoading,
  error,
  statusOptions,
  onSeeMore,
  onEdit,
  onChangeStatus,
}: OrdersListProps) {
  return (
    <DataTable
      className="min-w-7xl"
      columns={columns}
      emptyMessage="No orders found."
      error={error}
      errorMessage="Failed to load orders"
      isEmpty={orders.length === 0}
      isLoading={isLoading}
    >
      {orders.map((order) => {
        const orderKey = getOrderGroupKey(order)
        return (
          <OrderRow
            key={orderKey}
            order={order}
            statusOptions={statusOptions}
            onSeeMore={() => onSeeMore(order)}
            onEdit={() => onEdit(order)}
            onChangeStatus={(orderStatusId) => onChangeStatus(order.orderId, orderStatusId)}
          />
        )
      })}
    </DataTable>
  )
}
