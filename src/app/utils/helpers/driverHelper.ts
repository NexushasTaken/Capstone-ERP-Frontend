import { Pencil, Trash2 } from 'lucide-react'
import type { DriverSortOption } from '@/app/types/driver'
import type { StatusActionItem } from '@/app/types/statusAction'

export const driverSortOptions: DriverSortOption[] = [
  { label: 'Latest added', value: 'createdAt', order: 'desc' },
  { label: 'Name (A to Z)', value: 'name', order: 'asc' },
  { label: 'Name (Z to A)', value: 'name', order: 'desc' },
]

export const driverActionOptions: StatusActionItem[] = [
  {
    label: 'Update',
    value: 'update',
    icon: Pencil,
  },
  {
    label: 'Delete',
    value: 'delete',
    icon: Trash2,
    variant: 'destructive',
  },
]

export function formatDriverId(driverId: string | number) {
  return `DRV-${driverId}`
}

export function formatDriverDate(dateString: string | null) {
  if (!dateString) return '-'

  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getDriverFullName(driver: { firstName: string; lastName: string }) {
  return `${driver.firstName} ${driver.lastName}`.trim()
}

export function getDriverFilter(value: DriverSortOption) {
  if (value.value !== 'name') return 0

  return value.order === 'asc' ? 1 : 2
}

export const driverTableColumns = [
  'Id',
  'First Name',
  'Last Name',
  'Created At',
  'Action',
]

export const DRIVER_ITEMS_PER_PAGE = 10
