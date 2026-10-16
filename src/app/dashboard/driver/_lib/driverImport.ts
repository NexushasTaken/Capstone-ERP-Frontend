import { z } from "zod"
import type { ImportColumn } from "@/components/ImportModal"
import { textCell } from "@/lib/import/importCell"
import type { DriverImportRow } from "@/types/driver"

export const driverImportColumns: ImportColumn<DriverImportRow>[] = [
  { key: "firstName", label: "First name", required: true },
  { key: "lastName", label: "Last name", required: true },
]

// Same rules as the add-driver form.
export const driverImportSchema: z.ZodType<DriverImportRow> = z.object({
  firstName: textCell("First name is required."),
  lastName: textCell("Last name is required."),
})
