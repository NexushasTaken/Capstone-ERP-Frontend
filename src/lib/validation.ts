import { z } from "zod"

// Shared zod rules. They mirror the backend's FluentValidation rules so most mistakes are caught before sending.

export const EMAIL_PATTERN = /^[\w.-]+@[\w.-]+\.\w{2,}$/
export const MIN_PASSWORD_LENGTH = 8

export const requiredString = (message: string) => z.string().trim().min(1, message)

export const emailSchema = requiredString("Email is required.").regex(EMAIL_PATTERN, "Email is invalid.")

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)

/**
 * A number from an `<input type="number">` registered with `valueAsNumber`, or an id picked from a dropdown.
 * An empty input arrives as NaN, which fails here with `message`.
 */
export const requiredNumber = (message: string) => z.number({ error: message })

export const positiveInt = (message: string) => requiredNumber(message).int(message).gt(0, message)

/** An id chosen from a dropdown. 0 / unset means nothing was chosen. */
export const requiredId = (message: string) => positiveInt(message)
