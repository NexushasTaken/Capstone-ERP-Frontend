import {
  CircleDot,
  PackageMinus,
  PackagePlus,
  PackageX,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Undo2,
} from 'lucide-react'
import type {
  AuditActionOption,
  AuditFilterOption,
  AuditModuleOption,
  UserOption,
} from '@/types/auditLog'

export const AUDIT_LOG_ITEMS_PER_PAGE = 10
export const AUDIT_LOG_SIDEBAR_LIMIT = 10

// Values match the backend enums (AuditActionEnum / AuditModuleEnum).
export const auditActionOptions: AuditActionOption[] = [
  { value: 1, key: 'Create', label: 'Created', Icon: Plus, className: 'bg-[#E7F6EC] text-[#187B49]' },
  { value: 2, key: 'Update', label: 'Updated', Icon: Pencil, className: 'bg-[#E8F1FB] text-[#1769C2]' },
  { value: 3, key: 'Delete', label: 'Deleted', Icon: Trash2, className: 'bg-[#FDECEA] text-[#B42318]' },
  { value: 4, key: 'StatusChange', label: 'Status changed', Icon: RefreshCw, className: 'bg-[#F1ECFB] text-[#6941C6]' },
  { value: 5, key: 'IncreaseStock', label: 'Stock added', Icon: PackagePlus, className: 'bg-[#E7F6EC] text-[#187B49]' },
  { value: 6, key: 'ReturnStock', label: 'Stock returned', Icon: Undo2, className: 'bg-[#FFF4E0] text-[#9A5B00]' },
  { value: 7, key: 'CurrentItemDamage', label: 'Damaged (current)', Icon: PackageX, className: 'bg-[#FDECEA] text-[#B42318]' },
  { value: 8, key: 'ReturnItemDamage', label: 'Damaged (return)', Icon: PackageMinus, className: 'bg-[#FFF4E0] text-[#9A5B00]' },
]

export const auditModuleOptions: AuditModuleOption[] = [
  { value: 1, key: 'Category', label: 'Category' },
  { value: 2, key: 'Product', label: 'Product' },
  { value: 3, key: 'Driver', label: 'Driver' },
  { value: 4, key: 'Order', label: 'Order' },
  { value: 5, key: 'Inventory', label: 'Inventory' },
  { value: 6, key: 'Warehouse', label: 'Warehouse' },
]

// Values are sent as-is and must match the UserRole table exactly.
export const auditRoleFilterOptions: AuditFilterOption<string>[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'secretary', label: 'Secretary' },
]

export const auditActionFilterOptions: AuditFilterOption<number>[] = auditActionOptions.map(
  ({ value, label }) => ({ value, label })
)

export const auditModuleFilterOptions: AuditFilterOption<number>[] = auditModuleOptions.map(
  ({ value, label }) => ({ value, label })
)

export function toUserFilterOptions(users: UserOption[]): AuditFilterOption<number>[] {
  return users.map((user) => ({
    value: user.id,
    label: user.fullName || `User #${user.id}`,
    description: user.isActive ? undefined : 'Inactive',
  }))
}

const fallbackAction: Omit<AuditActionOption, 'value' | 'key' | 'label'> = {
  Icon: CircleDot,
  className: 'bg-[#F0F1F1] text-[#737A76]',
}

export function getAuditAction(key: string) {
  return auditActionOptions.find((action) => action.key === key) ?? { ...fallbackAction, label: key }
}

export function getAuditModuleLabel(key: string) {
  return auditModuleOptions.find((module) => module.key === key)?.label ?? key
}

export function formatAuditDate(dateString: string) {
  return new Date(dateString).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Short form for the sidebar: "now", "5m", "3h", "2d", then the date.
export function formatAuditRelativeTime(dateString: string, now = Date.now()) {
  const minutes = Math.floor((now - new Date(dateString).getTime()) / 60_000)

  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`

  return new Date(dateString).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}
