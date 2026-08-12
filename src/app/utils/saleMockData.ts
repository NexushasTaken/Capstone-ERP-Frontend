import type { Sale, SaleStatusFilter } from '@/app/types/sale'
import { DoorOpen, Hammer, KeyRound, LampDesk, Table2, Wrench } from 'lucide-react'

export const saleStatusFilters: SaleStatusFilter[] = [
  { label: 'Paid', count: 92 },
  { label: 'Processing', count: 41 },
  { label: 'Delivered', count: 48 },
  { label: 'Refunded', count: 8 },
]

export const mockSales: Sale[] = [
  { id: 'SA-2024-001', productName: 'Oak Dining Table', sku: 'TBL-OAK-180', productIcon: Table2, customer: 'Maria Santos', quantity: 1, total: 18900, saleDate: '12 Sep, 2024', status: 'Paid' },
  { id: 'SA-2024-002', productName: 'Smart Door Lock', sku: 'LCK-SMT-011', productIcon: KeyRound, customer: 'James Cruz', quantity: 2, total: 12500, saleDate: '12 Sep, 2024', status: 'Paid' },
  { id: 'SA-2024-003', productName: 'Panel Door', sku: 'DOR-PNL-90', productIcon: DoorOpen, customer: 'Ava Mendoza', quantity: 3, total: 28500, saleDate: '13 Sep, 2024', status: 'Paid' },
  { id: 'SA-2024-004', productName: 'Claw Hammer', sku: 'TOL-HMR-16', productIcon: Hammer, customer: 'Noel Garcia', quantity: 4, total: 1960, saleDate: '13 Sep, 2024', status: 'Paid' },
  { id: 'SA-2024-005', productName: 'Adjustable Wrench', sku: 'TOL-WRN-10', productIcon: Wrench, customer: 'Rina Villanueva', quantity: 2, total: 1780, saleDate: '14 Sep, 2024', status: 'Paid' },
  { id: 'SA-2024-006', productName: 'LED Desk Lamp', sku: 'LGT-LED-07', productIcon: LampDesk, customer: 'Paolo Reyes', quantity: 1, total: 1450, saleDate: '14 Sep, 2024', status: 'Paid' },
]
