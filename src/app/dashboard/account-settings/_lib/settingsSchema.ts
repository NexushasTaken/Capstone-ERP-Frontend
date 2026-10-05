import { z } from "zod"
import { emailSchema, MIN_PASSWORD_LENGTH, requiredString } from "@/lib/validation"

export const profileSchema = z.object({
  firstName: requiredString("First name is required."),
  lastName: requiredString("Last name is required."),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

// Password is optional: leave both password fields blank to keep the current one.
export const credentialsSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    email: emailSchema,
    password: z.string().refine((value) => value === "" || value.length >= MIN_PASSWORD_LENGTH, {
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    }),
    confirmPassword: z.string(),
  })
  .refine((form) => form.confirmPassword === form.password, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  })

export type CredentialsFormValues = z.infer<typeof credentialsSchema>
