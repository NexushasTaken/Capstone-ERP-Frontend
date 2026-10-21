"use client"

import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import EntityDropdown from "@/components/EntityDropdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPeso, formatQuantity } from "@/lib/format"
import { formatProductId } from "@/lib/helpers/productHelpers"
import type { ProductListItem } from "@/types/product"
import { emptyPurchaseLine, type PurchaseFormValues } from "../_lib/purchaseSchema"

interface PurchaseLinesEditorProps {
  products: ProductListItem[]
  productsLoading: boolean
  productsError: unknown
  disabled: boolean
}

// The purchase's products: what to buy, how many (in each product's unit) and the cost per unit.
// Must be rendered inside the purchase form's <FormProvider>.
export default function PurchaseLinesEditor({
  products,
  productsLoading,
  productsError,
  disabled,
}: PurchaseLinesEditorProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<PurchaseFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: "lines" })
  const lines = useWatch({ control, name: "lines" }) ?? []
  const productById = new Map(products.map((product) => [product.id, product]))
  const lineTotal = (index: number) => {
    const line = lines[index]
    const total = (line?.quantity ?? 0) * (line?.unitCost ?? 0)
    return Number.isFinite(total) ? total : 0
  }
  const grandTotal = lines.reduce((sum, _line, index) => sum + lineTotal(index), 0)

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <span className="text-xl font-medium text-foreground">Items</span>
          <span className="text-sm text-muted-foreground">
            What the store is buying, and what it pays per unit (not the selling price).
          </span>
        </div>
        <Button
          className="w-full sm:w-auto"
          disabled={disabled}
          onClick={() => append(emptyPurchaseLine)}
          type="button"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      <div className="max-h-96 overflow-auto rounded-xl border border-border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14 text-center text-foreground">#</TableHead>
              <TableHead className="min-w-72 text-foreground">Product</TableHead>
              <TableHead className="w-44 text-center text-foreground">Quantity</TableHead>
              <TableHead className="w-40 text-center text-foreground">Unit cost</TableHead>
              <TableHead className="w-36 text-center text-foreground">Total</TableHead>
              <TableHead className="w-20 text-center text-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => {
              const product = productById.get(lines[index]?.productId ?? 0)
              const lineErrors = errors.lines?.[index]
              return (
                <TableRow className="hover:bg-accent" key={field.id}>
                  <TableCell className="text-center font-medium text-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Controller
                        control={control}
                        name={`lines.${index}.productId`}
                        render={({ field: productField }) => (
                          <EntityDropdown
                            emptyLabel={
                              productsError ? "Failed to load products. Try searching again." : "No products found"
                            }
                            isLoading={productsLoading}
                            onSelect={productField.onChange}
                            // A product can only appear on one line.
                            options={products
                              .filter(
                                (option) =>
                                  !lines.some(
                                    (other, otherIndex) => otherIndex !== index && other?.productId === option.id,
                                  ),
                              )
                              .map((option) => ({
                                id: option.id,
                                label: option.name,
                                sublabel: `${formatProductId(option.id)} · Stock: ${formatQuantity(option.stock ?? 0, option.unitName)}`,
                              }))}
                            placeholder="Select product"
                            searchPlaceholder="Search products..."
                            value={product?.name ?? ""}
                          />
                        )}
                      />
                      {lineErrors?.productId && (
                        <span className="text-xs text-destructive">{lineErrors.productId.message}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <Input
                          aria-invalid={!!lineErrors?.quantity}
                          aria-label={product?.unitName ? `Quantity in ${product.unitName}` : "Quantity"}
                          className="w-24 text-center"
                          disabled={disabled}
                          min={1}
                          step={1}
                          type="number"
                          {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                        />
                        {product?.unitName && <span className="text-sm text-muted-foreground">{product.unitName}</span>}
                      </div>
                      {lineErrors?.quantity && (
                        <span className="text-xs text-destructive">{lineErrors.quantity.message}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      <Input
                        aria-invalid={!!lineErrors?.unitCost}
                        aria-label="Unit cost"
                        className="w-32 text-center"
                        disabled={disabled}
                        min={0}
                        step="any"
                        type="number"
                        {...register(`lines.${index}.unitCost`, { valueAsNumber: true })}
                      />
                      {lineErrors?.unitCost && (
                        <span className="text-xs text-destructive">{lineErrors.unitCost.message}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium text-foreground">
                    {formatPeso(lineTotal(index))}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      aria-label={`Remove line ${index + 1}`}
                      disabled={disabled || fields.length === 1}
                      onClick={() => remove(index)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          <TableFooter className="border-t border-border bg-background">
            <TableRow className="hover:bg-transparent">
              <TableCell className="text-right font-medium text-foreground" colSpan={4}>
                Total cost
              </TableCell>
              <TableCell className="text-center font-semibold text-foreground">{formatPeso(grandTotal)}</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      {(errors.lines?.message || errors.lines?.root?.message) && (
        <span className="mt-2 text-sm text-destructive">{errors.lines?.message ?? errors.lines?.root?.message}</span>
      )}
    </div>
  )
}
