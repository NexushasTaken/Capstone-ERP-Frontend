'use client'

import { Search, X, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import CloseButton from '@/app/components/CloseButton'
import AppModal from '@/app/components/modals/AppModal'
import { PaginationDemo } from '@/app/components/Pagination'
import SortPopover from '@/app/components/SortPopover'
import StatusAction from '@/app/components/StatusAction'
import { useCurrentUser } from '@/app/hooks/useCurrentUser'
import { allowedActions, can } from '@/app/utils/permissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AccountListItem, AccountSortBy } from '@/app/types/account'
import { createAccount, fetchAccounts, updateAccountRole } from '@/app/services/accountApi'
import {
  ACCOUNT_ITEMS_PER_PAGE,
  accountSortOptions,
  accountTableColumns,
  editAccountActions,
  formatAccountId,
  roleOptions,
} from '@/app/utils/helpers/accountHelper'
import Loading from '@/app/components/loaders/Loading'
import { queryKeys } from '@/app/utils/query/queryKeys'
import { invalidateAccounts } from '@/app/utils/query/queryInvalidation'

const LOCKED_ACCOUNT_ID = 1

const emptyCreateForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'secretary' as AccountListItem['role'],
}

export default function AccountsForm() {
  const { data: currentUser } = useCurrentUser()
  const role = currentUser?.role
  const accountActions = allowedActions(role, 'account', editAccountActions)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<AccountSortBy>('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<AccountListItem | null>(null)
  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [editRole, setEditRole] = useState<AccountListItem['role']>('secretary')
  const queryClient = useQueryClient()

  const {
    data: accounts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.accounts.all,
    queryFn: fetchAccounts,
  })

  const addAccountMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => toast.success('Account created successfully'),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to create account'),
    onSettled: () => invalidateAccounts(queryClient),
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role: newRole }: { id: number; role: AccountListItem['role'] }) => updateAccountRole(id, newRole),
    onSuccess: () => toast.success('Account updated successfully'),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update account'),
    onSettled: () => invalidateAccounts(queryClient),
  })

  const isSubmitting = addAccountMutation.isPending || updateRoleMutation.isPending

  const filteredAccounts = useMemo(() => {
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

    return [...matched].sort((a, b) => {
      switch (sortBy) {
        case 'id':
          return sortOrder === 'asc' ? a.id - b.id : b.id - a.id
        case 'role':
          return sortOrder === 'asc' ? a.role.localeCompare(b.role) : b.role.localeCompare(a.role)
        case 'firstName':
          return sortOrder === 'asc' ? a.firstName.localeCompare(b.firstName) : b.firstName.localeCompare(a.firstName)
        case 'lastName':
          return sortOrder === 'asc' ? a.lastName.localeCompare(b.lastName) : b.lastName.localeCompare(a.lastName)
        case 'email':
          return sortOrder === 'asc' ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email)
        default:
          return 0
      }
    })
  }, [accounts, search, sortBy, sortOrder])

  const pageCount = Math.max(1, Math.ceil(filteredAccounts.length / ACCOUNT_ITEMS_PER_PAGE))
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * ACCOUNT_ITEMS_PER_PAGE,
    currentPage * ACCOUNT_ITEMS_PER_PAGE
  )

  const createCanSubmit =
    createForm.firstName.trim() !== '' &&
    createForm.lastName.trim() !== '' &&
    createForm.email.trim() !== '' &&
    createForm.password.length >= 8 &&
    createForm.password === createForm.confirmPassword

  const editCanSubmit =
    !!selectedAccount && selectedAccount.id !== LOCKED_ACCOUNT_ID && editRole !== selectedAccount.role

  function resetCreateForm() {
    setCreateForm(emptyCreateForm)
  }

  function resetEditState() {
    setSelectedAccount(null)
  }

  async function handleCreateAccount() {
    if (!createCanSubmit) return

    setIsAddModalOpen(false)
    resetCreateForm()
    setCurrentPage(1)

    addAccountMutation.mutate({
      firstName: createForm.firstName.trim(),
      lastName: createForm.lastName.trim(),
      email: createForm.email.trim(),
      password: createForm.password,
      role: createForm.role,
    })
  }

  async function handleUpdateRole() {
    if (!selectedAccount || !editCanSubmit) return

    const id = selectedAccount.id

    setIsEditModalOpen(false)
    resetEditState()

    updateRoleMutation.mutate({ id, role: editRole })
  }

  function openEditModal(account: AccountListItem) {
    setSelectedAccount(account)
    setEditRole(account.role)
    setIsEditModalOpen(true)
  }

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-2xl bg-white p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-[#121514]">Accounts</h1>
          <span className="rounded-md border border-[#DFE2E0] px-3 py-1 text-sm text-[#121514]">
            {filteredAccounts.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search accounts"
              className="w-full rounded-xl border border-[#DFE2E0] bg-white px-3 py-2 text-sm text-[#121514] placeholder:text-[#737A76] focus:border-[#121514] focus:outline-none focus:ring-1 focus:ring-[#121514]"
            />
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setCurrentPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737A76] cursor-pointer transition-colors hover:text-[#121514]"
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <Search className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-[#737A76]" />
            )}
          </div>

          {can(role, 'account:create') && (
            <Button
              className="rounded-xl cursor-pointer px-3 py-2 text-sm"
              onClick={() => {
                resetCreateForm()
                setIsAddModalOpen(true)
              }}
              type="button"
            >
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
            ) : paginatedAccounts.length === 0 ? (
              <tr>
                <td colSpan={accountTableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
                  No accounts found.
                </td>
              </tr>
            ) : (
              paginatedAccounts.map((account) => (
                <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={account.id}>
                  <td className="rounded-l-xl px-3 py-5 font-medium whitespace-nowrap">{formatAccountId(account.id)}</td>
                  <td className="px-3 py-5 whitespace-nowrap capitalize">{account.role}</td>
                  <td className="px-3 py-5 font-medium whitespace-nowrap capitalize">{account.firstName}</td>
                  <td className="px-3 py-5 font-medium whitespace-nowrap capitalize">{account.lastName}</td>
                  <td className="px-3 py-5 whitespace-nowrap">{account.email}</td>
                  <td className="rounded-r-xl px-3 py-5">
                    <div className="flex items-center justify-end">
                      {accountActions.length > 0 && (
                        <StatusAction
                          actions={accountActions}
                          label={`More actions for account ${account.id}`}
                          onAction={(action) => {
                            if (action === 'edit') openEditModal(account)
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
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-[#737A76]">
          Showing {paginatedAccounts.length} of {filteredAccounts.length} accounts
        </span>
        <div className="flex">
          <PaginationDemo currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />
        </div>
      </div>

      <AppModal
        className="flex max-h-fit flex-col lg:max-w-lg"
        onClose={() => {
          setIsAddModalOpen(false)
          resetCreateForm()
        }}
        open={isAddModalOpen}
      >
        <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#737A76]">New account</span>
            <span className="text-xl font-medium text-[#0c0d0d]">Create account</span>
          </div>
          <CloseButton
            onClick={() => {
              setIsAddModalOpen(false)
              resetCreateForm()
            }}
          />
        </div>

        <div className="flex flex-col gap-4 p-4">
          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">First Name</span>
            <Input
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => setCreateForm((prev) => ({ ...prev, firstName: event.target.value }))}
              value={createForm.firstName}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Last Name</span>
            <Input
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => setCreateForm((prev) => ({ ...prev, lastName: event.target.value }))}
              value={createForm.lastName}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Email</span>
            <Input
              type="email"
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
              value={createForm.email}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Password</span>
            <Input
              type="password"
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
              value={createForm.password}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Confirm Password</span>
            <Input
              type="password"
              className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => setCreateForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              value={createForm.confirmPassword}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Role</span>
            <Select
              items={roleOptions}
              value={createForm.role}
              onValueChange={(value) => {
                if (value) setCreateForm((prev) => ({ ...prev, role: value }))
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-xl border-[#DFE2E0] bg-white px-3 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
          <Button
            className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
            onClick={() => {
              setIsAddModalOpen(false)
              resetCreateForm()
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl px-3 py-2 text-sm"
            disabled={!createCanSubmit || isSubmitting}
            onClick={handleCreateAccount}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Create account
          </Button>
        </div>
      </AppModal>

      <AppModal
        className="flex max-h-fit flex-col lg:max-w-lg"
        onClose={() => {
          setIsEditModalOpen(false)
          resetEditState()
        }}
        open={isEditModalOpen}
      >
        <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
          <div className="flex flex-col">
            <span className="text-xs text-[#737A76]">{selectedAccount ? formatAccountId(selectedAccount.id) : ''}</span>
            <span className="text-xl font-medium text-[#0c0d0d]">Edit account</span>
          </div>
          <CloseButton
            onClick={() => {
              setIsEditModalOpen(false)
              resetEditState()
            }}
          />
        </div>

        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col">
            <span className="font-medium text-[#0c0d0d] capitalize">
              {selectedAccount ? `${selectedAccount.lastName}, ${selectedAccount.firstName}` : ''}
            </span>
            <span className="text-sm text-[#ACABAA]">{selectedAccount?.email}</span>
          </div>

          <label className="flex flex-col gap-1 text-sm text-[#121514]">
            <span className="text-xs text-[#68716C]">Role</span>
            <Select
              disabled={selectedAccount?.id === LOCKED_ACCOUNT_ID}
              items={roleOptions}
              value={editRole}
              onValueChange={(value) => {
                if (value) setEditRole(value)
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-xl border-[#DFE2E0] bg-white px-3 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAccount?.id === LOCKED_ACCOUNT_ID && (
              <span className="text-xs text-[#ACABAA]">This account&apos;s role cannot be changed.</span>
            )}
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
          <Button
            className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
            onClick={() => {
              setIsEditModalOpen(false)
              resetEditState()
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl px-3 py-2 text-sm"
            disabled={!editCanSubmit || isSubmitting}
            onClick={handleUpdateRole}
            type="button"
          >
            Save changes
          </Button>
        </div>
      </AppModal>
    </section>
  )
}
