import type { LucideIcon } from 'lucide-react'
import { ClipboardList, PackageCheck, ReceiptText } from 'lucide-react'
import { mockRawMaterials } from '@/app/utils/inventoryMockData'
import { mockOrders } from '@/app/utils/orderMockData'
import { mockSales } from '@/app/utils/saleMockData'

export interface AuditLog {
  id: string
  label: string
  detail: string
  firstName: string
  time: string
  Icon: LucideIcon
  className: string
}

const auditUsers = ['Juan', 'Angela', 'Miguel', 'Rina', 'Paolo', 'Lara']

const inventoryAuditLogs: AuditLog[] = mockRawMaterials.slice(0, 6).map((item, index) => ({
  id: `inventory-${item.id}`,
  label: item.material,
  detail: `${item.status} at ${item.warehouse}`,
  firstName: auditUsers[index],
  time: `${index + 4}m ago`,
  Icon: PackageCheck,
  className: 'bg-[#EBF3ED] text-[#425B49]',
}))

const salesAuditLogs: AuditLog[] = mockSales.slice(0, 6).map((sale, index) => ({
  id: `sale-${sale.id}`,
  label: sale.productName,
  detail: `${sale.customer} checkout ${sale.status.toLowerCase()}`,
  firstName: auditUsers[index],
  time: `${index + 10}m ago`,
  Icon: ReceiptText,
  className: 'bg-[#F6EFE6] text-[#7A4E22]',
}))

const orderAuditLogs: AuditLog[] = mockOrders.slice(0, 6).map((order, index) => ({
  id: `order-${order.id}`,
  label: `Order #${order.id.slice(-4)}`,
  detail: `${order.assignedTo} ${order.status.toLowerCase()}`,
  firstName: auditUsers[index],
  time: `${index + 16}m ago`,
  Icon: ClipboardList,
  className: 'bg-[#EEF2F7] text-[#334D6E]',
}))

export const auditLogs: AuditLog[] = [
  inventoryAuditLogs[1],
  salesAuditLogs[0],
  orderAuditLogs[2],
  inventoryAuditLogs[4],
  salesAuditLogs[3],
  orderAuditLogs[0],
  inventoryAuditLogs[2],
  salesAuditLogs[5],
  orderAuditLogs[4],
  inventoryAuditLogs[0],
  salesAuditLogs[2],
  orderAuditLogs[5],
]
