import { Plus, Trash2 } from 'lucide-react'
import EntityDropdown from '@/components/EntityDropdown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatPeso } from '@/lib/format'
import type { getOrderLineRows } from '@/lib/helpers/orderHelpers'
import type { OrderLineForm } from '@/types/order'
import type { ProductListItem } from '@/types/product'

interface OrderLinesEditorProps {
  lines: OrderLineForm[]
  /** `lines` with product, unit price and subtotal filled in. */
  lineRows: ReturnType<typeof getOrderLineRows>
  totalAmount: number
  products: ProductListItem[]
  productsLoading: boolean
  productsError: unknown
  onChange: (lines: OrderLineForm[]) => void
}

// The "Order items" table in the create-order modal: pick products and quantities.
export default function OrderLinesEditor({
  lines,
  lineRows,
  totalAmount,
  products,
  productsLoading,
  productsError,
  onChange,
}: OrderLinesEditorProps) {
  const productOptions = products.map((product) => ({
    id: product.id,
    label: product.name,
    sublabel: `ID: ${product.id}`,
  }))

  function updateLine(index: number, field: keyof OrderLineForm, value: string) {
    onChange(lines.map((line, lineIndex) => (lineIndex === index ? { ...line, [field]: value } : line)))
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <span className="text-xl font-medium text-foreground">Order items</span>
          <span className="text-sm text-muted-foreground">Add one or more products to this order.</span>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => onChange([...lines, { productId: '', quantity: '1' }])}
          type="button"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      <div className="overflow-auto max-h-96 rounded-xl border border-border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14 text-center text-foreground">#</TableHead>
              <TableHead className="min-w-72 text-foreground">Product</TableHead>
              <TableHead className="w-36 text-center text-foreground">Unit price</TableHead>
              <TableHead className="w-40 text-center text-foreground">Quantity</TableHead>
              <TableHead className="w-36 text-center text-foreground">Subtotal</TableHead>
              <TableHead className="w-24 text-center text-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineRows.map((line, index) => (
              <TableRow className="hover:bg-accent" key={index}>
                <TableCell className="text-center font-medium text-foreground">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <EntityDropdown
                      emptyLabel={productsError ? 'Failed to load products. Try searching again.' : 'No products found'}
                      isLoading={productsLoading}
                      onSelect={(productId) => updateLine(index, 'productId', String(productId))}
                      // A product can only appear on one line.
                      options={productOptions.filter(
                        (product) =>
                          !lines.some(
                            (otherLine, otherIndex) =>
                              otherIndex !== index && Number(otherLine.productId) === product.id,
                          ),
                      )}
                      placeholder="Select product"
                      searchPlaceholder="Search products..."
                      value={line.product?.name ?? ''}
                    />
                    {line.product ? <span className="text-xs text-muted-foreground">ID: {line.product.id}</span> : null}
                  </div>
                </TableCell>
                <TableCell className="text-center text-foreground">{formatPeso(line.unitPrice)}</TableCell>
                <TableCell>
                  <Input
                    className="mx-auto w-28 text-center"
                    min={1}
                    onChange={(event) => updateLine(index, 'quantity', event.target.value)}
                    type="number"
                    value={line.quantity || ''}
                  />
                </TableCell>
                <TableCell className="text-center font-medium text-foreground">{formatPeso(line.subtotal)}</TableCell>
                <TableCell className="text-center">
                  <button
                    aria-label="Remove order line"
                    className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-destructive/30 bg-background text-destructive transition-colors hover:bg-destructive/10"
                    disabled={lines.length === 1}
                    onClick={() => onChange(lines.filter((_, lineIndex) => lineIndex !== index))}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="border-t border-border bg-background">
            <TableRow className="hover:bg-transparent">
              <TableCell className="text-right text-sm font-semibold uppercase text-foreground" colSpan={4}>
                Total
              </TableCell>
              <TableCell className="text-center text-base font-medium text-green-700">
                {formatPeso(totalAmount)}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
