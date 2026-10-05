import DataTable, { type DataTableColumn } from "@/components/DataTable"
import StatusAction from "@/components/StatusAction"
import { TableCell, TableRow } from "@/components/ui/table"
import type { AccountListItem } from "@/types/account"
import type { StatusActionItem } from "@/types/statusAction"
import { formatAccountId } from "../_lib/accountHelpers"

const columns: DataTableColumn[] = [
  "Id",
  "Role",
  "First Name",
  "Last Name",
  "Email",
  { label: "Action", className: "text-right" },
]

interface AccountsTableProps {
  accounts: AccountListItem[]
  isLoading: boolean
  error: unknown
  actions: StatusActionItem[]
  onEdit: (account: AccountListItem) => void
}

export default function AccountsTable({ accounts, isLoading, error, actions, onEdit }: AccountsTableProps) {
  return (
    <DataTable
      className="min-w-150"
      columns={columns}
      emptyMessage="No accounts found."
      error={error}
      errorMessage="Failed to load accounts"
      isEmpty={accounts.length === 0}
      isLoading={isLoading}
    >
      {accounts.map((account) => (
        <TableRow key={account.id}>
          <TableCell className="px-3 py-4 font-medium">{formatAccountId(account.id)}</TableCell>
          <TableCell className="px-3 py-4 capitalize">{account.role}</TableCell>
          <TableCell className="px-3 py-4 font-medium capitalize">{account.firstName}</TableCell>
          <TableCell className="px-3 py-4 font-medium capitalize">{account.lastName}</TableCell>
          <TableCell className="px-3 py-4">{account.email}</TableCell>
          <TableCell className="px-3 py-4">
            <div className="flex items-center justify-end">
              {actions.length > 0 && (
                <StatusAction
                  actions={actions}
                  label={`More actions for account ${account.id}`}
                  onAction={(action) => {
                    if (action === "edit") onEdit(account)
                  }}
                />
              )}
            </div>
          </TableCell>
        </TableRow>
      ))}
    </DataTable>
  )
}
