import DataTable, { type DataTableColumn } from "@/components/DataTable"
import StatusAction from "@/components/StatusAction"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  capitalize,
  formatInventoryId,
  formatNumber,
  getInventoryStatusStyleFromLabel,
} from "@/lib/helpers/inventoryHelpers"
import type { InventoryListItem } from "@/types/inventory"
import type { StatusActionItem } from "@/types/statusAction"

const columns: DataTableColumn[] = [
  "Inventory ID",
  "Name",
  "Quantity",
  "Reorder point",
  "Warehouse",
  "Status",
  { label: "Inventory actions", srOnly: true },
]

interface InventoryTableProps {
  items: InventoryListItem[]
  isLoading: boolean
  error: unknown
  actions: StatusActionItem[]
  onShowDetails: (item: InventoryListItem) => void
  /** Called with the action's value: 'edit', 'delete', 'restock' or 'damage'. */
  onAction: (action: string, item: InventoryListItem) => void
}

export default function InventoryTable({
  items,
  isLoading,
  error,
  actions,
  onShowDetails,
  onAction,
}: InventoryTableProps) {
  return (
    <DataTable
      className="min-w-200"
      columns={columns}
      emptyMessage="No inventory items found."
      error={error}
      errorMessage="Failed to load inventory"
      isEmpty={items.length === 0}
      isLoading={isLoading}
    >
      {items.map((item) => {
        const statusStyle = getInventoryStatusStyleFromLabel(item.status)

        return (
          <TableRow key={item.id}>
            <TableCell className="px-3 py-4 font-medium">{formatInventoryId(String(item.id))}</TableCell>
            <TableCell className="px-3 py-4 font-medium capitalize">{item.name}</TableCell>
            <TableCell className="px-3 py-4">{formatNumber(item.quantity)}</TableCell>
            <TableCell className="px-3 py-4">{formatNumber(item.reorderPoint)}</TableCell>
            <TableCell className="px-3 py-4 font-medium capitalize">{item.warehouseName}</TableCell>
            <TableCell className={`px-3 py-4 font-medium ${statusStyle.labelClassName}`}>
              <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${statusStyle.dotClassName}`} />
              {capitalize(item.status)}
            </TableCell>
            <TableCell className="px-3 py-4">
              <div className="flex items-center justify-end gap-2">
                <Button onClick={() => onShowDetails(item)} size="sm" type="button" variant="outline">
                  See more
                </Button>
                {actions.length > 0 && (
                  <StatusAction
                    actions={actions}
                    label={`More actions for inventory ${item.id}`}
                    onAction={(action) => onAction(action, item)}
                  />
                )}
              </div>
            </TableCell>
          </TableRow>
        )
      })}
    </DataTable>
  )
}
