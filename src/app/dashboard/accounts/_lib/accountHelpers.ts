import { Pencil, Trash2 } from "lucide-react"
import type { AccountSortBy, AccountSortOption } from "@/types/account"
import type { StatusActionItem } from "@/types/statusAction"

export const accountSortOptions: AccountSortOption[] = [
  { label: "Id", value: "id", order: "asc" },
  { label: "Role (A to Z)", value: "role", order: "asc" },
  { label: "First name (A to Z)", value: "firstName", order: "asc" },
  { label: "First name (Z to A)", value: "firstName", order: "desc" },
]

export const accountActionOptions: StatusActionItem[] = [
  {
    label: "Edit",
    value: "edit",
    icon: Pencil,
  },
  {
    label: "Delete",
    value: "delete",
    icon: Trash2,
    variant: "destructive",
  },
]

export function formatAccountId(accountId: string | number) {
  return `ACC-${accountId}`
}

export const ACCOUNT_ITEMS_PER_PAGE = 10

export const roleOptions: Array<{
  label: string
  value: "owner" | "secretary"
}> = [
  { label: "Owner", value: "owner" },
  { label: "Secretary", value: "secretary" },
]

// The first (owner) account's role can't be changed, and it can't be deleted.
export const LOCKED_ACCOUNT_ID = 1

// The backend's `filter` sort code for GET /api/User/accounts.
export function getAccountFilter(sortBy: AccountSortBy, sortOrder: "asc" | "desc") {
  switch (sortBy) {
    case "role":
      return 1
    case "firstName":
      return sortOrder === "asc" ? 2 : 3
    default:
      return 0
  }
}
