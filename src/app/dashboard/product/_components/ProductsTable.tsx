import Loading from '@/components/Loading'
import StatusAction from '@/components/StatusAction'
import { formatDate, formatPeso } from '@/lib/format'
import type { ProductListItem } from '@/types/product'
import type { StatusActionItem } from '@/types/statusAction'
import { formatProductId, tableColumns } from '../_lib/productHelpers'

interface ProductsTableProps {
  products: ProductListItem[]
  isLoading: boolean
  error: unknown
  actions: StatusActionItem[]
  onShowDetails: (product: ProductListItem) => void
  onEdit: (product: ProductListItem) => void
  onDelete: (product: ProductListItem) => void
}

export default function ProductsTable({
  products,
  isLoading,
  error,
  actions,
  onShowDetails,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  return (
    <table className="w-full min-w-235 border-separate border-spacing-y-2 text-left">
      <thead className="text-sm font-normal text-[#737A76]">
        <tr>
          {tableColumns.map((column) => (
            <th className="px-3 pb-1 font-normal" key={column} scope="col">
              {column}
            </th>
          ))}
          <th className="px-3 pb-1 font-normal text-right" scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={tableColumns.length + 1} className="px-3 py-4 text-center text-sm text-[#737A76]">
              <Loading />
            </td>
          </tr>
        ) : error ? (
          <tr>
            <td colSpan={tableColumns.length + 1} className="px-3 py-4 text-center text-sm text-red-500">
              {error instanceof Error ? error.message : 'Failed to load products'}
            </td>
          </tr>
        ) : products.length === 0 ? (
          <tr>
            <td colSpan={tableColumns.length + 1} className="px-3 py-4 text-center text-sm text-[#737A76]">
              No products found.
            </td>
          </tr>
        ) : (
          products.map((product) => (
            <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={product.id}>
              <td className="rounded-l-xl px-3 py-5 font-medium">{formatProductId(product.id)}</td>
              <td className="px-3 py-5 font-medium whitespace-nowrap capitalize">{product.categoryName ?? 'Uncategorized'}</td>
              <td className="px-3 py-5 whitespace-nowrap capitalize">{product.name}</td>
              <td className="px-3 py-5 font-medium whitespace-nowrap">{formatPeso(product.price)}</td>
              <td className="px-3 py-5 whitespace-nowrap">{formatDate(product.created_At)}</td>
              <td className="rounded-r-xl px-3 py-5">
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-1.5 text-sm whitespace-nowrap transition-all hover:bg-[#DCE4DF]"
                    type="button"
                    onClick={() => onShowDetails(product)}
                  >
                    See more
                  </button>
                  {actions.length > 0 && (
                    <StatusAction
                      actions={actions}
                      label={`More actions for product ${product.id}`}
                      onAction={(action) => {
                        if (action === 'edit') onEdit(product)
                        if (action === 'delete') onDelete(product)
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
