import { Pencil } from 'lucide-react'
import type { AccountSortOption } from '@/types/account'
import type { StatusActionItem } from '@/types/statusAction'

export const accountSortOptions: AccountSortOption[] = [
  { label: 'Id', value: 'id', order: 'asc' },
  { label: 'Role (A to Z)', value: 'role', order: 'asc' },
  { label: 'First name (A to Z)', value: 'firstName', order: 'asc' },
  { label: 'First name (Z to A)', value: 'firstName', order: 'desc' },
]

export const editAccountActions: StatusActionItem[] = [
  {
    label: 'Edit',
    value: 'edit',
    icon: Pencil,
  },
]

export function formatAccountId(accountId: string | number) {
  return `ACC-${accountId}`
}

export const accountTableColumns = [
  'Id',
  'Role',
  'First Name',
  'Last Name',
  'Email',
  'Action',
]

export const ACCOUNT_ITEMS_PER_PAGE = 10

export const roleOptions: Array<{ label: string; value: 'owner' | 'secretary' }> = [
  { label: 'Owner', value: 'owner' },
  { label: 'Secretary', value: 'secretary' },
]
