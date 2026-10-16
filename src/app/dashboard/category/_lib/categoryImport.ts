import { z } from "zod"
import type { ImportColumn } from "@/components/ImportModal"
import { textCell } from "@/lib/import/importCell"
import { checkCategoryImport } from "@/services/categoryApi"
import type { CategoryImportRow } from "@/types/category"

export const categoryImportColumns: ImportColumn<CategoryImportRow>[] = [{ key: "type", label: "Name", required: true }]

export const categoryImportSchema: z.ZodType<CategoryImportRow> = z.object({
  type: textCell("Category name is required."),
})

// Sends the names for the server's on-pick check (already used, repeated in the file).
export function checkCategoryCells(cells: Record<string, string>[]) {
  return checkCategoryImport(cells.map((c) => ({ type: c.type })))
}
