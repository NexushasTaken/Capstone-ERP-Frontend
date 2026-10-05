import Loading from '@/components/Loading'
import StatusAction from '@/components/StatusAction'
import type { AccountListItem } from '@/types/account'
import type { StatusActionItem } from '@/types/statusAction'
import { accountTableColumns, formatAccountId } from '../_lib/accountHelpers'

interface AccountsTableProps {
  accounts: AccountListItem[]
  isLoading: boolean
  error: unknown
  actions: StatusActionItem[]
  onEdit: (account: AccountListItem) => void
}

export default function AccountsTable({ accounts, isLoading, error, actions, onEdit }: AccountsTableProps) {
  return (
    <table className="w-full min-w-150 border-separate border-spacing-y-2 text-left">
      <thead className="text-sm font-normal text-[#737A76]">
        <tr>
          {accountTableColumns.map((column) => (
            <th
              className={`px-3 pb-1 font-normal ${column === 'Action' ? 'text-right' : ''}`}
              key={column}
              scope="col"
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={accountTableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
              <Loading />
            </td>
          </tr>
        ) : error ? (
          <tr>
            <td colSpan={accountTableColumns.length} className="px-3 py-4 text-center text-sm text-red-500">
              {error instanceof Error ? error.message : 'Failed to load accounts'}
            </td>
          </tr>
        ) : accounts.length === 0 ? (
          <tr>
            <td colSpan={accountTableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
              No accounts found.
            </td>
          </tr>
        ) : (
          accounts.map((account) => (
            <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={account.id}>
              <td className="rounded-l-xl px-3 py-5 font-medium whitespace-nowrap">{formatAccountId(account.id)}</td>
              <td className="px-3 py-5 whitespace-nowrap capitalize">{account.role}</td>
              <td className="px-3 py-5 font-medium whitespace-nowrap capitalize">{account.firstName}</td>
              <td className="px-3 py-5 font-medium whitespace-nowrap capitalize">{account.lastName}</td>
              <td className="px-3 py-5 whitespace-nowrap">{account.email}</td>
              <td className="rounded-r-xl px-3 py-5">
                <div className="flex items-center justify-end">
                  {actions.length > 0 && (
                    <StatusAction
                      actions={actions}
                      label={`More actions for account ${account.id}`}
                      onAction={(action) => {
                        if (action === 'edit') onEdit(account)
                      }}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
