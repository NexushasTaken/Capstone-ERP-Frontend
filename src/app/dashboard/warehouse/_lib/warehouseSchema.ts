import { z } from "zod"
import { requiredString } from "@/lib/validation"

export const warehouseSchema = z.object({
  name: requiredString("Warehouse name is required."),
  address: requiredString("Warehouse address is required."),
})

export type WarehouseFormValues = z.infer<typeof warehouseSchema>
