import DataTable, { type DataTableColumn } from "@/components/DataTable"
import StatusAction from "@/components/StatusAction"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/format"
import { formatNumber } from "@/lib/helpers/inventoryHelpers"
import type { StatusActionItem } from "@/types/statusAction"
import type { WarehouseListItem } from "@/types/warehouse"
import { formatWarehouseId } from "../_lib/warehouseHelpers"

const columns: DataTableColumn[] = [
  "Id",
  "Name",
  "Address",
  "Items",
  "Created At",
  { label: "Action", className: "text-right" },
]

interface WarehousesTableProps {
  warehouses: WarehouseListItem[]
  isLoading: boolean
  error: unknown
  actions: StatusActionItem[]
  onEdit: (warehouse: WarehouseListItem) => void
  onDelete: (warehouse: WarehouseListItem) => void
}

export default function WarehousesTable({
  warehouses,
  isLoading,
  error,
  actions,
  onEdit,
  onDelete,
}: WarehousesTableProps) {
  return (
    <DataTable
      className="min-w-200"
      columns={columns}
      emptyMessage="No warehouses found."
      error={error}
      errorMessage="Failed to load warehouses"
      isEmpty={warehouses.length === 0}
      isLoading={isLoading}
    >
      {warehouses.map((warehouse) => (
        <TableRow key={warehouse.id}>
          <TableCell className="px-3 py-4 font-medium">{formatWarehouseId(warehouse.id)}</TableCell>
          <TableCell className="px-3 py-4 font-medium capitalize">{warehouse.name}</TableCell>
          <TableCell className="px-3 py-4 capitalize">{warehouse.address}</TableCell>
          <TableCell className="px-3 py-4">{formatNumber(warehouse.stocks)}</TableCell>
          <TableCell className="px-3 py-4">{formatDate(warehouse.created_At)}</TableCell>
          <TableCell className="px-3 py-4">
            <div className="flex items-center justify-end">
              {actions.length > 0 && (
                <StatusAction
                  actions={actions}
                  label={`More actions for warehouse ${warehouse.id}`}
                  onAction={(action) => {
                    if (action === "edit") onEdit(warehouse)
                    if (action === "delete") onDelete(warehouse)
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
