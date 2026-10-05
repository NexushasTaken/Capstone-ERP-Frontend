import { z } from "zod"
import { emailSchema, passwordSchema, requiredString } from "@/lib/validation"

const roleSchema = z.enum(["owner", "secretary"], { error: "Role must be owner or secretary." })

export const createAccountSchema = z
  .object({
    firstName: requiredString("First name is required."),
    lastName: requiredString("Last name is required."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    role: roleSchema,
  })
  .refine((form) => form.confirmPassword === form.password, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  })

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>

export const editRoleSchema = z.object({ role: roleSchema })

export type EditRoleFormValues = z.infer<typeof editRoleSchema>
