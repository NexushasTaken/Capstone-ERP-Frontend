"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import PageTitle from "@/components/PageTitle"
import SearchInput from "@/components/SearchInput"
import SortPopover from "@/components/SortPopover"
import { TablePagination } from "@/components/TablePagination"
import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { allowedActions, can } from "@/lib/permissions"
import type { AccountListItem, AccountSortBy } from "@/types/account"
import { useAccountMutations, useAccounts } from "../_hooks/useAccounts"
import {
  ACCOUNT_ITEMS_PER_PAGE,
  accountSortOptions,
  editAccountActions,
  getAccountFilter,
} from "../_lib/accountHelpers"
import AccountsTable from "./AccountsTable"
import CreateAccountModal, { type NewAccount } from "./CreateAccountModal"
import EditAccountRoleModal from "./EditAccountRoleModal"

// Which modal is open, and for which account.
type ModalState = { type: "create" } | { type: "edit"; account: AccountListItem } | null

export default function AccountsView() {
  const { data: currentUser } = useCurrentUser()
  const role = currentUser?.role
  const accountActions = allowedActions(role, "account", editAccountActions)

  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<AccountSortBy>("id")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [modal, setModal] = useState<ModalState>(null)

  const debouncedSearch = useDebouncedValue(search.trim())

  const { data, isLoading, error } = useAccounts({
    page: currentPage,
    pageSize: ACCOUNT_ITEMS_PER_PAGE,
    name: debouncedSearch || undefined,
    filter: getAccountFilter(sortBy, sortOrder),
  })
  const mutations = useAccountMutations()

  const accounts = data?.items ?? []
  const rows = data?.rows ?? 0
  const pageCount = Math.max(1, data?.pageCount ?? 1)
  const closeModal = () => setModal(null)

  // Close only once the account exists; on failure the modal stays open with its inputs.
  async function handleCreateAccount(account: NewAccount) {
    await mutations.createAccount.mutateAsync(account)
    closeModal()
    setCurrentPage(1)
  }

  function handleUpdateRole(newRole: AccountListItem["role"]) {
    if (modal?.type !== "edit") return
    mutations.updateRole.mutate({ id: modal.account.id, role: newRole })
    closeModal()
  }

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-2xl bg-background p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <PageTitle title="Accounts" count={rows} />

        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            placeholder="Search accounts"
          />

          {can(role, "account:create") && (
            <Button onClick={() => setModal({ type: "create" })} type="button">
              <Plus className="h-4 w-4" />
              Create account
            </Button>
          )}
          <SortPopover
            value={sortBy}
            order={sortOrder}
            options={accountSortOptions}
            onChange={(value, order) => {
              setSortBy(value)
              setSortOrder(order)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      <div className="mt-5 min-h-0 overflow-auto scrollbar-none">
        <AccountsTable
          accounts={accounts}
          isLoading={isLoading}
          error={error}
          actions={accountActions}
          onEdit={(account) => setModal({ type: "edit", account })}
        />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-muted-foreground">
          Showing {accounts.length} of {rows} accounts
        </span>
        <div className="flex">
          <TablePagination currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />
        </div>
      </div>

      <CreateAccountModal
        open={modal?.type === "create"}
        disabled={mutations.isSubmitting}
        onClose={closeModal}
        onSubmit={handleCreateAccount}
      />
      {modal?.type === "edit" && (
        <EditAccountRoleModal
          account={modal.account}
          disabled={mutations.isSubmitting}
          onClose={closeModal}
          onSubmit={handleUpdateRole}
        />
      )}
    </section>
  )
}
