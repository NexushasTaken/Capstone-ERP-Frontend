"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import CountFilterSelect from "@/components/CountFilterSelect"
import ListHeader from "@/components/ListHeader"
import ListSummary from "@/components/ListSummary"
import PageSizeSelect from "@/components/PageSizeSelect"
import SearchInput from "@/components/SearchInput"
import SortPopover from "@/components/SortPopover"
import { TablePagination } from "@/components/TablePagination"
import { Button } from "@/components/ui/button"
import { usePageSize } from "@/hooks/usePageSize"
import { useUrlSearch } from "@/hooks/useUrlSearch"
import { formatCount } from "@/lib/format"
import type { Purchase } from "@/types/purchase"
import { usePurchaseFilters } from "../_hooks/usePurchaseFilters"
import { usePurchaseMutations, usePurchases, usePurchaseStatusCounts } from "../_hooks/usePurchases"
import { purchaseSortOptions, purchaseStatusIds, purchaseStatusStyles } from "../_lib/purchaseHelpers"
import CancelPurchaseModal from "./CancelPurchaseModal"
import PurchaseDetailsModal from "./PurchaseDetailsModal"
import PurchaseFormModal from "./PurchaseFormModal"
import PurchasesTable from "./PurchasesTable"
import ReceivePurchaseModal from "./ReceivePurchaseModal"

// Which modal is open, and for which purchase.
type ModalState = { type: "add" } | { type: "edit" | "receive" | "cancel" | "details"; purchase: Purchase } | null

// Stock bought from suppliers (owner only). Stock changes only when a purchase is received.
export default function PurchasesView() {
  const { values: filters, update } = usePurchaseFilters()
  const { sortBy, sortOrder, page: currentPage } = filters
  const [search, setSearch] = useUrlSearch(filters.search, (value) => update({ search: value }))
  const [pageSize, setPageSize] = usePageSize("purchases")
  const [modal, setModal] = useState<ModalState>(null)

  const listParams = {
    page: currentPage,
    pageSize,
    name: filters.search || undefined,
    statusId: purchaseStatusIds[filters.status] ?? 0,
    filter: sortOrder === "asc" ? 1 : 0,
  }
  const { data, isLoading, isPlaceholderData, error } = usePurchases(listParams)
  const { data: statusCounts, isError: statusCountsError } = usePurchaseStatusCounts()
  const mutations = usePurchaseMutations()

  const purchases = data?.items ?? []
  const rows = data?.rows ?? 0
  const pageCount = Math.max(1, data?.pageCount ?? 1)
  const countsAvailable = !!statusCounts && !statusCountsError
  const countOf = (status: string) => statusCounts?.find((item) => item.status === status)?.count ?? 0
  const statusOptions = [
    { value: "All", label: "All statuses", count: statusCounts?.reduce((sum, item) => sum + item.count, 0) },
    ...(["ordered", "received", "cancelled"] as const).map((status) => ({
      value: status,
      label: purchaseStatusStyles[status].label,
      count: countOf(status),
    })),
  ].map((option) => ({ ...option, count: countsAvailable ? option.count : undefined }))
  // Show the latest copy of the selected purchase rather than the one clicked.
  const modalPurchase =
    modal && modal.type !== "add" ? (purchases.find((p) => p.id === modal.purchase.id) ?? modal.purchase) : null
  const closeModal = () => setModal(null)

  function handleCancel() {
    if (modal?.type !== "cancel") return
    mutations.cancelPurchase.mutate(modal.purchase.id, { onSuccess: closeModal })
  }

  return (
    <section className="flex h-dvh w-full flex-col overflow-hidden rounded-2xl bg-background p-4 lg:p-5">
      <ListHeader
        title="Purchases"
        actions={
          <Button onClick={() => setModal({ type: "add" })} type="button">
            <Plus className="h-4 w-4" />
            New purchase
          </Button>
        }
        search={<SearchInput value={search} onChange={setSearch} placeholder="Search by supplier, product or PO" />}
        filters={
          <>
            <CountFilterSelect
              aria-label="Filter purchases by status"
              options={statusOptions}
              value={filters.status}
              onChange={(status) => update({ status })}
            />
            <SortPopover
              value={sortBy}
              order={sortOrder}
              options={purchaseSortOptions}
              onChange={(value, order) => update({ sortBy: value, sortOrder: order })}
            />
          </>
        }
      />

      <ListSummary>
        {formatCount(rows, "purchase")}
        {countsAvailable && countOf("ordered") > 0 && (
          <> · {countOf("ordered").toLocaleString("en-PH")} waiting to be received</>
        )}
      </ListSummary>

      <div className="mt-5 min-h-0 flex-1 overflow-auto scrollbar-x-only">
        <PurchasesTable
          purchases={purchases}
          isLoading={isLoading || isPlaceholderData}
          error={error}
          onShowDetails={(purchase) => setModal({ type: "details", purchase })}
          onAction={(action, purchase) => {
            if (mutations.isSubmitting) return
            if (action === "edit" || action === "receive" || action === "cancel") setModal({ type: action, purchase })
          }}
        />
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Showing {purchases.length} of {rows} purchases
          </span>
          <PageSizeSelect
            value={pageSize}
            onChange={(size) => {
              setPageSize(size)
              update({ page: 1 })
            }}
          />
        </div>
        <div className="flex">
          <TablePagination currentPage={currentPage} totalPages={pageCount} onPageChange={(page) => update({ page })} />
        </div>
      </div>

      {modal?.type === "add" && (
        <PurchaseFormModal
          purchase={null}
          isPending={mutations.addPurchase.isPending}
          onClose={closeModal}
          onSubmit={(payload) => {
            update({ page: 1 })
            return mutations.addPurchase.mutateAsync(payload)
          }}
        />
      )}

      {modal?.type === "edit" && modalPurchase && (
        <PurchaseFormModal
          purchase={modalPurchase}
          isPending={mutations.updatePurchase.isPending}
          onClose={closeModal}
          onSubmit={(payload) => mutations.updatePurchase.mutateAsync({ id: modalPurchase.id, ...payload })}
        />
      )}

      {modal?.type === "receive" && modalPurchase && (
        <ReceivePurchaseModal
          purchase={modalPurchase}
          isPending={mutations.receivePurchase.isPending}
          onClose={closeModal}
          onSubmit={(payload) => mutations.receivePurchase.mutateAsync(payload)}
        />
      )}

      <CancelPurchaseModal
        purchase={modal?.type === "cancel" ? modalPurchase : null}
        disabled={mutations.isSubmitting}
        onClose={closeModal}
        onConfirm={handleCancel}
      />

      <PurchaseDetailsModal purchase={modal?.type === "details" ? modalPurchase : null} onClose={closeModal} />
    </section>
  )
}
