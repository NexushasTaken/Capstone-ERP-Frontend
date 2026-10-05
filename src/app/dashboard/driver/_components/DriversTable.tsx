import DataTable, { type DataTableColumn } from '@/components/DataTable'
import StatusAction from '@/components/StatusAction'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/format'
import type { DriverListItem } from '@/types/driver'
import type { StatusActionItem } from '@/types/statusAction'
import { formatDriverId } from '../_lib/driverHelpers'

const columns: DataTableColumn[] = ['Id', 'First Name', 'Last Name', 'Created At', { label: 'Action', className: 'text-right' }]

interface DriversTableProps {
  drivers: DriverListItem[]
  isLoading: boolean
  error: unknown
  actions: StatusActionItem[]
  onUpdate: (driver: DriverListItem) => void
  onDelete: (driver: DriverListItem) => void
}

export default function DriversTable({ drivers, isLoading, error, actions, onUpdate, onDelete }: DriversTableProps) {
  return (
    <DataTable
      className="min-w-150"
      columns={columns}
      emptyMessage="No drivers found."
      error={error}
      errorMessage="Failed to load drivers"
      isEmpty={drivers.length === 0}
      isLoading={isLoading}
    >
      {drivers.map((driver) => (
        <TableRow key={driver.id}>
          <TableCell className="px-3 py-4 font-medium">{formatDriverId(driver.id)}</TableCell>
          <TableCell className="px-3 py-4 font-medium capitalize">{driver.firstName}</TableCell>
          <TableCell className="px-3 py-4 font-medium capitalize">{driver.lastName}</TableCell>
          <TableCell className="px-3 py-4">{formatDate(driver.created_At)}</TableCell>
          <TableCell className="px-3 py-4">
            <div className="flex items-center justify-end">
              {actions.length > 0 && (
                <StatusAction
                  actions={actions}
                  label={`More actions for driver ${driver.id}`}
                  onAction={(action) => {
                    if (action === 'update') onUpdate(driver)
                    if (action === 'delete') onDelete(driver)
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
