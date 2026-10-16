import { z } from "zod"
import type { ImportColumn } from "@/components/ImportModal"
import { optionalPositiveIntCell, optionalTextCell, positiveNumberCell, textCell } from "@/lib/import/importCell"
import { checkProductImport } from "@/services/productApi"
import type { ProductImportRow } from "@/types/product"

export const productImportColumns: ImportColumn<ProductImportRow>[] = [
  { key: "name", label: "Name", required: true },
  { key: "category", label: "Category" },
  { key: "price", label: "Price", required: true },
  { key: "quantity", label: "Quantity" },
  { key: "reorderPoint", label: "Reorder point" },
]

export const productImportHint =
  "Category must already exist (blank means no category). Fill in Quantity and Reorder point to add opening stock."

// Mirrors the backend: a stock record needs both a quantity and a reorder point.
export const productImportSchema: z.ZodType<ProductImportRow> = z
  .object({
    name: textCell("Product name is required."),
    category: optionalTextCell(),
    price: positiveNumberCell("Price must be greater than 0."),
    quantity: optionalPositiveIntCell("Quantity must be a whole number above 0."),
    reorderPoint: optionalPositiveIntCell("Reorder point must be a whole number above 0."),
  })
  .superRefine((row, ctx) => {
    if (row.quantity !== undefined && row.reorderPoint === undefined) {
      ctx.addIssue({ code: "custom", path: ["reorderPoint"], message: "Reorder point is required with a quantity." })
    }
    if (row.reorderPoint !== undefined && row.quantity === undefined) {
      ctx.addIssue({ code: "custom", path: ["quantity"], message: "Quantity is required with a reorder point." })
    }
  })

// Sends only the columns the server checks on pick (name, category).
export function checkProductCells(cells: Record<string, string>[]) {
  return checkProductImport(cells.map((c) => ({ name: c.name, category: c.category || undefined })))
}
