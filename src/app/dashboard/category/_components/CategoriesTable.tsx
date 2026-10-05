import Loading from '@/components/Loading'
import StatusAction from '@/components/StatusAction'
import { formatDate } from '@/lib/format'
import type { CategoryListItem } from '@/types/category'
import type { StatusActionItem } from '@/types/statusAction'
import { formatCategoryId, tableColumns } from '../_lib/categoryHelpers'

interface CategoriesTableProps {
  categories: CategoryListItem[]
  isLoading: boolean
  error: unknown
  actions: StatusActionItem[]
  onEdit: (category: CategoryListItem) => void
  onDelete: (category: CategoryListItem) => void
}

export default function CategoriesTable({ categories, isLoading, error, actions, onEdit, onDelete }: CategoriesTableProps) {
  return (
    <table className="w-full min-w-150 border-separate border-spacing-y-2 text-left">
      <thead className="text-sm font-normal text-[#737A76]">
        <tr>
          {tableColumns.map((column) => (
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
            <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
              <Loading />
            </td>
          </tr>
        ) : error ? (
          <tr>
            <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-red-500">
              {error instanceof Error ? error.message : 'Failed to load categories'}
            </td>
          </tr>
        ) : categories.length === 0 ? (
          <tr>
            <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-sm text-[#737A76]">
              No categories found.
            </td>
          </tr>
        ) : (
          categories.map((category) => (
            <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={category.id}>
              <td className="rounded-l-xl px-3 py-5 font-medium whitespace-nowrap">{formatCategoryId(category.id)}</td>
              <td className="px-3 py-5 font-medium whitespace-nowrap capitalize">{category.type}</td>
              <td className="px-3 py-5 whitespace-nowrap">{formatDate(category.created_At)}</td>
              <td className="rounded-r-xl px-3 py-5">
                <div className="flex items-center justify-end">
                  {actions.length > 0 && (
                    <StatusAction
                      actions={actions}
                      label={`More actions for category ${category.id}`}
                      onAction={(action) => {
                        if (action === 'edit') onEdit(category)
                        if (action === 'delete') onDelete(category)
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
