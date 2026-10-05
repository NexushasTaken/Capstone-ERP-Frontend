import { z } from "zod"
import { requiredNumber, requiredString } from "@/lib/validation"

export const productSchema = z.object({
  name: requiredString("Product name is required."),
  /** 0 means no category. */
  categoryId: z.number().int().min(0),
  price: requiredNumber("Price is required.").gt(0, "Price must be greater than 0."),
})

export type ProductFormValues = z.infer<typeof productSchema>
