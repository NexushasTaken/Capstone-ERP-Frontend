import { PackageCheck, Pencil, XCircle } from "lucide-react"
import DataTable, { type DataTableColumn } from "@/components/DataTable"
import StatusAction from "@/components/StatusAction"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatPeso } from "@/lib/format"
import type { Purchase } from "@/types/purchase"
import type { StatusActionItem } from "@/types/statusAction"
import { formatDay, formatPurchaseId, formatSupplier } from "../_lib/purchaseHelpers"
import PurchaseStatusLabel from "./PurchaseStatusLabel"

const columns: DataTableColumn[] = [
  "PO",
  "Supplier",
  "Ordered on",
  "Items",
  "Total cost",
  "Status",
  { label: "Action", className: "text-right", srOnly: true },
]

// Only an ordered purchase can be received, edited or cancelled.
const orderedActions: StatusActionItem[] = [
  { label: "Receive", value: "receive", icon: PackageCheck },
  { label: "Edit", value: "edit", icon: Pencil },
  { label: "Cancel purchase", value: "cancel", icon: XCircle, variant: "destructive" },
]

interface PurchasesTableProps {
  purchases: Purchase[]
  isLoading: boolean
  error: unknown
  onShowDetails: (purchase: Purchase) => void
  onAction: (action: string, purchase: Purchase) => void
}

export default function PurchasesTable({ purchases, isLoading, error, onShowDetails, onAction }: PurchasesTableProps) {
  return (
    <DataTable
      className="min-w-235"
      columns={columns}
      emptyMessage="No purchases found."
      error={error}
      errorMessage="Failed to load purchases"
      isEmpty={purchases.length === 0}
      isLoading={isLoading}
    >
      {purchases.map((purchase) => (
        <TableRow className="cursor-pointer" key={purchase.id} onClick={() => onShowDetails(purchase)}>
          <TableCell className="px-3 py-4 font-medium">{formatPurchaseId(purchase.id)}</TableCell>
          <TableCell className="px-3 py-4 capitalize">{formatSupplier(purchase.supplierName)}</TableCell>
          <TableCell className="px-3 py-4">{formatDay(purchase.orderedOn)}</TableCell>
          <TableCell className="px-3 py-4">{purchase.lines.length.toLocaleString("en-PH")}</TableCell>
          <TableCell className="px-3 py-4 font-medium">
            {formatPeso(purchase.status === "received" ? (purchase.receivedTotal ?? 0) : purchase.total)}
          </TableCell>
          <TableCell className="px-3 py-4">
            <PurchaseStatusLabel status={purchase.status} />
          </TableCell>
          <TableCell className="px-3 py-4">
            {/* Stop clicks here (incl. the portaled dropdown) from also opening the row's details. */}
            <div className="flex items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
              <Button onClick={() => onShowDetails(purchase)} size="sm" type="button" variant="outline">
                See more
              </Button>
              {purchase.status === "ordered" && (
                <StatusAction
                  actions={orderedActions}
                  label={`More actions for purchase ${purchase.id}`}
                  onAction={(action) => onAction(action, purchase)}
                />
              )}
            </div>
          </TableCell>
        </TableRow>
      ))}
    </DataTable>
  )
}
