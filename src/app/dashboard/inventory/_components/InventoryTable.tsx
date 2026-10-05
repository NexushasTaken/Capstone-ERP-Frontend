import Loading from '@/components/Loading'
import StatusAction from '@/components/StatusAction'
import {
  capitalize,
  formatInventoryId,
  formatNumber,
  getInventoryStatusStyleFromLabel,
  inventoryColumns,
} from '@/lib/helpers/inventoryHelpers'
import type { InventoryListItem } from '@/types/inventory'
import type { StatusActionItem } from '@/types/statusAction'

interface InventoryTableProps {
  items: InventoryListItem[]
  isLoading: boolean
  error: unknown
  actions: StatusActionItem[]
  onShowDetails: (item: InventoryListItem) => void
  /** Called with the action's value: 'edit', 'delete', 'restock' or 'damage'. */
  onAction: (action: string, item: InventoryListItem) => void
}

export default function InventoryTable({ items, isLoading, error, actions, onShowDetails, onAction }: InventoryTableProps) {
  return (
    <table className="w-full min-w-200 border-separate border-spacing-y-2 text-left">
      <thead className="text-sm font-normal text-[#737A76]">
        <tr>
          {inventoryColumns.map((column) => (
            <th className="px-3 pb-1 font-normal" key={column} scope="col">
              {column}
            </th>
          ))}
          <th aria-label="Inventory actions" />
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={inventoryColumns.length + 1} className="px-3 py-4 text-center text-sm text-[#737A76]">
              <span className='flex h-96'><Loading /></span>
            </td>
          </tr>
        ) : error ? (
          <tr>
            <td colSpan={inventoryColumns.length + 1} className="px-3 py-4 text-center text-sm text-[#B42318]">
              {error instanceof Error ? error.message : 'Failed to load inventory'}
            </td>
          </tr>
        ) : items.length === 0 ? (
          <tr>
            <td colSpan={inventoryColumns.length + 1} className="px-3 py-4 text-center text-sm text-[#737A76]">
              No inventory items found.
            </td>
          </tr>
        ) : (
          items.map((item) => {
            const statusStyle = getInventoryStatusStyleFromLabel(item.status)

            return (
              <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={item.id}>
                <td className="rounded-l-xl px-3 py-4 font-medium whitespace-nowrap">{formatInventoryId(String(item.id))}</td>
                <td className="px-3 py-4 font-medium whitespace-nowrap capitalize">{item.name}</td>
                <td className="px-3 py-4 whitespace-nowrap">{formatNumber(item.quantity)}</td>
                <td className="px-3 py-4 whitespace-nowrap">{formatNumber(item.reorderPoint)}</td>
                <td className="px-3 py-4 font-medium whitespace-nowrap capitalize">{item.warehouseName}</td>
                <td className={`px-3 py-4 font-medium whitespace-nowrap ${statusStyle.labelClassName}`}>
                  <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${statusStyle.dotClassName}`} />
                  {capitalize(item.status)}
                </td>
                <td className="rounded-r-xl px-3 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-1.5 text-sm whitespace-nowrap transition-all hover:bg-[#DCE4DF]"
                      type="button"
                      onClick={() => onShowDetails(item)}
                    >
                      See more
                    </button>
                    {actions.length > 0 && (
                      <StatusAction
                        actions={actions}
                        label={`More actions for inventory ${item.id}`}
                        onAction={(action) => onAction(action, item)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            )
          })
        )}
      </tbody>
    </table>
  )
}
