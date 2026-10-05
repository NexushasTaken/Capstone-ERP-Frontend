import type { FieldValues, Path, UseFormSetError } from "react-hook-form"
import { isValidationError } from "./apiError"

/**
 * Puts the backend's 400 field errors under their inputs.
 * `rename` maps a request field to a form field when their names differ.
 * Returns true when it handled the error, so the caller can skip the toast.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  rename: Record<string, Path<T>> = {},
): boolean {
  if (!isValidationError(error)) return false

  const entries = Object.entries(error.fieldErrors)
  if (entries.length === 0) {
    setError("root.server" as Path<T>, { message: error.message })
    return true
  }

  entries.forEach(([field, message], index) => {
    setError(rename[field] ?? (field as Path<T>), { message }, { shouldFocus: index === 0 })
  })
  return true
}
