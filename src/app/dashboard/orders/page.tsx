import type { Metadata } from 'next'
import OrdersView from './_components/OrdersView'

export const metadata: Metadata = { title: 'Orders' }

export default function OrdersPage() {
  return <OrdersView />
}
