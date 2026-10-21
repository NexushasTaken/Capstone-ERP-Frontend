import { z } from "zod"
import { requiredString } from "@/lib/validation"

export const unitSchema = z.object({
  name: requiredString("Unit name is required.").max(20, "Unit name can be at most 20 characters."),
})

export type UnitFormValues = z.infer<typeof unitSchema>
