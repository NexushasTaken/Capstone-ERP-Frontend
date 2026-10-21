import DataTable, { type DataTableColumn } from "@/components/DataTable"
import StatusAction from "@/components/StatusAction"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/format"
import type { UnitListItem } from "@/types/unit"
import type { StatusActionItem } from "@/types/statusAction"
import { formatUnitId } from "../_lib/unitHelpers"

const columns: DataTableColumn[] = [
  "Id",
  "Name",
  "Products",
  "Created At",
  { label: "Action", className: "text-right" },
]

interface UnitsTableProps {
  units: UnitListItem[]
  isLoading: boolean
  error: unknown
  actions: StatusActionItem[]
  onEdit: (unit: UnitListItem) => void
  onDelete: (unit: UnitListItem) => void
}

export default function UnitsTable({ units, isLoading, error, actions, onEdit, onDelete }: UnitsTableProps) {
  return (
    <DataTable
      className="min-w-150"
      columns={columns}
      emptyMessage="No units found."
      error={error}
      errorMessage="Failed to load units"
      isEmpty={units.length === 0}
      isLoading={isLoading}
    >
      {units.map((unit) => {
        // A unit in use can't be deleted, so don't offer it.
        const rowActions = unit.productCount > 0 ? actions.filter((action) => action.value !== "delete") : actions
        return (
          <TableRow key={unit.id}>
            <TableCell className="px-3 py-4 font-medium">{formatUnitId(unit.id)}</TableCell>
            <TableCell className="px-3 py-4 font-medium">{unit.name}</TableCell>
            <TableCell className="px-3 py-4">{unit.productCount.toLocaleString("en-PH")}</TableCell>
            <TableCell className="px-3 py-4">{formatDate(unit.created_At)}</TableCell>
            <TableCell className="px-3 py-4">
              <div className="flex items-center justify-end">
                {rowActions.length > 0 && unit.id > 0 && (
                  <StatusAction
                    actions={rowActions}
                    label={`More actions for unit ${unit.id}`}
                    onAction={(action) => {
                      if (action === "edit") onEdit(unit)
                      if (action === "delete") onDelete(unit)
                    }}
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
