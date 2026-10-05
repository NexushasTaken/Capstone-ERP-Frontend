import { z } from "zod"
import { requiredString } from "@/lib/validation"

export const driverSchema = z.object({
  firstName: requiredString("First name is required."),
  lastName: requiredString("Last name is required."),
})

export type DriverFormValues = z.infer<typeof driverSchema>
