import DataTable, { type DataTableColumn } from "@/components/DataTable"
import StatusAction from "@/components/StatusAction"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatDate, formatPeso } from "@/lib/format"
import type { ProductListItem } from "@/types/product"
import type { StatusActionItem } from "@/types/statusAction"
import { formatProductId } from "../_lib/productHelpers"

const columns: DataTableColumn[] = [
  "Product ID",
  "Category",
  "Product Name",
  "Price",
  "Created At",
  { label: "Action", className: "text-right" },
]

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
    <DataTable
      className="min-w-235"
      columns={columns}
      emptyMessage="No products found."
      error={error}
      errorMessage="Failed to load products"
      isEmpty={products.length === 0}
      isLoading={isLoading}
    >
      {products.map((product) => (
        <TableRow key={product.id}>
          <TableCell className="px-3 py-4 font-medium">{formatProductId(product.id)}</TableCell>
          <TableCell className="px-3 py-4 font-medium capitalize">{product.categoryName ?? "Uncategorized"}</TableCell>
          <TableCell className="px-3 py-4 capitalize">{product.name}</TableCell>
          <TableCell className="px-3 py-4 font-medium">{formatPeso(product.price)}</TableCell>
          <TableCell className="px-3 py-4">{formatDate(product.created_At)}</TableCell>
          <TableCell className="px-3 py-4">
            <div className="flex items-center justify-end gap-2">
              <Button onClick={() => onShowDetails(product)} size="sm" type="button" variant="outline">
                See more
              </Button>
              {actions.length > 0 && (
                <StatusAction
                  actions={actions}
                  label={`More actions for product ${product.id}`}
                  onAction={(action) => {
                    if (action === "edit") onEdit(product)
                    if (action === "delete") onDelete(product)
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
