import { z } from "zod"
import { requiredString } from "@/lib/validation"

export const categorySchema = z.object({
  name: requiredString("Category name is required."),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
