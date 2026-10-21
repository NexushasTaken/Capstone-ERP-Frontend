import { Controller, useFieldArray, useFormContext } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import EntityDropdown from "@/components/EntityDropdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPeso, formatQuantity } from "@/lib/format"
import { cn } from "@/lib/utils"
import { formatProductId } from "@/lib/helpers/productHelpers"
import { getStockLeft, type getOrderLineRows } from "@/lib/helpers/orderHelpers"
import type { ProductListItem } from "@/types/product"
import { emptyOrderLine, type OrderFields } from "../_lib/orderSchema"
import type { DiscountType } from "@/types/order"
import OrderTotalRows from "./OrderTotalRows"

interface OrderLinesEditorProps {
  /** The form's order lines with product, unit price and subtotal filled in. */
  lineRows: ReturnType<typeof getOrderLineRows>
  /** Sum of the line subtotals, before the discount. */
  totalAmount: number
  discountPercent?: number
  discountType?: DiscountType
  products: ProductListItem[]
  productsLoading: boolean
  productsError: unknown
  /** Quantity per product this order already took from stock (edit only); it counts as available again. */
  heldQuantities?: Record<number, number>
}

// The "Order items" table in the create-order modal: pick products and quantities.
// Must be rendered inside the create-order form's <FormProvider>.
export default function OrderLinesEditor({
  lineRows,
  totalAmount,
  discountPercent,
  discountType,
  products,
  productsLoading,
  productsError,
  heldQuantities = {},
}: OrderLinesEditorProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<OrderFields>()
  const { fields, append, remove } = useFieldArray({ control, name: "orderLines" })

  const stockLeft = getStockLeft(lineRows, heldQuantities)

  const productOptions = products.map((product) => ({
    id: product.id,
    label: product.name,
    sublabel: productLabel(product, stockLeft(product)),
  }))

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <span className="text-xl font-medium text-foreground">Order items</span>
          <span className="text-sm text-muted-foreground">Add one or more products to this order.</span>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => append(emptyOrderLine)} type="button" variant="outline">
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
            {fields.map((field, index) => {
              const line = lineRows[index]
              const lineErrors = errors.orderLines?.[index]
              const isOverStock = !!line?.product && stockLeft(line.product) < 0
              return (
                <TableRow className="hover:bg-accent" key={field.id}>
                  <TableCell className="text-center font-medium text-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Controller
                        control={control}
                        name={`orderLines.${index}.productId`}
                        render={({ field: productField }) => (
                          <EntityDropdown
                            emptyLabel={
                              productsError ? "Failed to load products. Try searching again." : "No products found"
                            }
                            isLoading={productsLoading}
                            onSelect={productField.onChange}
                            // A product can only appear on one line.
                            options={productOptions.filter(
                              (product) =>
                                !lineRows.some(
                                  (otherLine, otherIndex) => otherIndex !== index && otherLine.productId === product.id,
                                ),
                            )}
                            placeholder="Select product"
                            searchPlaceholder="Search products..."
                            value={line?.product?.name ?? ""}
                          />
                        )}
                      />
                      {line?.product ? (
                        <span
                          className={cn(
                            "text-xs text-muted-foreground",
                            stockLeft(line.product) < 0 && "text-destructive",
                          )}
                        >
                          {productLabel(line.product, stockLeft(line.product))}
                        </span>
                      ) : null}
                      {lineErrors?.productId && (
                        <span className="text-xs text-destructive">{lineErrors.productId.message}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-foreground">{formatPeso(line?.unitPrice ?? 0)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <Input
                          aria-invalid={!!lineErrors?.quantity || isOverStock}
                          aria-label={line?.product?.unitName ? `Quantity in ${line.product.unitName}` : "Quantity"}
                          className="w-28 text-center"
                          min={1}
                          type="number"
                          {...register(`orderLines.${index}.quantity`, { valueAsNumber: true })}
                        />
                        {line?.product?.unitName && (
                          <span className="text-sm text-muted-foreground">{line.product.unitName}</span>
                        )}
                      </div>
                      {lineErrors?.quantity ? (
                        <span className="text-xs text-destructive">{lineErrors.quantity.message}</span>
                      ) : isOverStock && line?.product ? (
                        <span className="text-center text-xs text-destructive">
                          Not enough stock: only{" "}
                          {formatQuantity(
                            (line.product.stock ?? 0) + (heldQuantities[line.product.id] ?? 0),
                            line.product.unitName,
                          )}{" "}
                          available.
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium text-foreground">
                    {formatPeso(line?.subtotal ?? 0)}
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      aria-label="Remove order line"
                      className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-destructive/30 bg-background text-destructive transition-colors hover:bg-destructive/10"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          <TableFooter className="border-t border-border bg-background">
            <OrderTotalRows
              discountPercent={discountPercent}
              discountType={discountType}
              labelColSpan={4}
              subtotal={totalAmount}
              trailingCells={1}
            />
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}

// "PR-12 · Stock: 40": stock left (what an order draws from) after this order's quantities.
function productLabel(product: ProductListItem, stock: number) {
  return `${formatProductId(product.id)} · Stock: ${formatQuantity(stock, product.unitName)}`
}
