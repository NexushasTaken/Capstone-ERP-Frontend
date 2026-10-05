import { Pencil } from 'lucide-react'
import type { AccountListItem, AccountSortBy, AccountSortOption } from '@/types/account'
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

export const ACCOUNT_ITEMS_PER_PAGE = 10

export const roleOptions: Array<{ label: string; value: 'owner' | 'secretary' }> = [
  { label: 'Owner', value: 'owner' },
  { label: 'Secretary', value: 'secretary' },
]

// The first (owner) account's role can't be changed.
export const LOCKED_ACCOUNT_ID = 1

// The backend returns every account at once, so search, sort and paging happen in the browser.
export function filterAndSortAccounts(
  accounts: AccountListItem[],
  search: string,
  sortBy: AccountSortBy,
  sortOrder: 'asc' | 'desc'
) {
  const searchValue = search.trim().toLowerCase()
  const matched = searchValue
    ? accounts.filter((account) =>
        account.firstName.toLowerCase().includes(searchValue) ||
        account.lastName.toLowerCase().includes(searchValue) ||
        account.email.toLowerCase().includes(searchValue) ||
        account.role.toLowerCase().includes(searchValue) ||
        String(account.id).includes(searchValue)
      )
    : accounts
  const direction = sortOrder === 'asc' ? 1 : -1

  return [...matched].sort((a, b) => {
    switch (sortBy) {
      case 'id':
        return (a.id - b.id) * direction
      case 'role':
      case 'firstName':
      case 'lastName':
      case 'email':
        return a[sortBy].localeCompare(b[sortBy]) * direction
      default:
        return 0
    }
  })
}
