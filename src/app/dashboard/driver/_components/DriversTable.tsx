import Loading from '@/components/Loading'
import StatusAction from '@/components/StatusAction'
import { formatDate } from '@/lib/format'
import type { DriverListItem } from '@/types/driver'
import type { StatusActionItem } from '@/types/statusAction'
import { driverTableColumns, formatDriverId } from '../_lib/driverHelpers'

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
    <table className="w-full min-w-150 border-separate border-spacing-y-2 text-left">
      <thead className="text-sm font-normal text-[#737A76]">
        <tr>
          {driverTableColumns.map((column) => (
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
            <td colSpan={driverTableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
              <Loading />
            </td>
          </tr>
        ) : error ? (
          <tr>
            <td colSpan={driverTableColumns.length} className="px-3 py-4 text-center text-sm text-red-500">
              {error instanceof Error ? error.message : 'Failed to load drivers'}
            </td>
          </tr>
        ) : drivers.length === 0 ? (
          <tr>
            <td colSpan={driverTableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
              No drivers found.
            </td>
          </tr>
        ) : (
          drivers.map((driver) => (
            <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={driver.id}>
              <td className="rounded-l-xl px-3 py-5 font-medium whitespace-nowrap">{formatDriverId(driver.id)}</td>
              <td className="px-3 py-5 font-medium whitespace-nowrap capitalize">{driver.firstName}</td>
              <td className="px-3 py-5 font-medium whitespace-nowrap capitalize">{driver.lastName}</td>
              <td className="px-3 py-5 whitespace-nowrap">{formatDate(driver.created_At)}</td>
              <td className="rounded-r-xl px-3 py-5">
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
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
