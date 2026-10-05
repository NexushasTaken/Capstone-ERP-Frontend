import DataTable, { type DataTableColumn } from '@/components/DataTable'
import StatusAction from '@/components/StatusAction'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/format'
import type { CategoryListItem } from '@/types/category'
import type { StatusActionItem } from '@/types/statusAction'
import { formatCategoryId } from '../_lib/categoryHelpers'

const columns: DataTableColumn[] = ['Id', 'Type', 'Created At', { label: 'Action', className: 'text-right' }]

interface CategoriesTableProps {
  categories: CategoryListItem[]
  isLoading: boolean
  error: unknown
  actions: StatusActionItem[]
  onEdit: (category: CategoryListItem) => void
  onDelete: (category: CategoryListItem) => void
}

export default function CategoriesTable({
  categories,
  isLoading,
  error,
  actions,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  return (
    <DataTable
      className="min-w-150"
      columns={columns}
      emptyMessage="No categories found."
      error={error}
      errorMessage="Failed to load categories"
      isEmpty={categories.length === 0}
      isLoading={isLoading}
    >
      {categories.map((category) => (
        <TableRow key={category.id}>
          <TableCell className="px-3 py-4 font-medium">{formatCategoryId(category.id)}</TableCell>
          <TableCell className="px-3 py-4 font-medium capitalize">{category.type}</TableCell>
          <TableCell className="px-3 py-4">{formatDate(category.created_At)}</TableCell>
          <TableCell className="px-3 py-4">
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
          </TableCell>
        </TableRow>
      ))}
    </DataTable>
  )
}
