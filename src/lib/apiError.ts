// An error from the backend that keeps the HTTP status, so callers can tell
// a rejected input (400) apart from other failures.
export class ApiError extends Error {
  /** First message per rejected field, keyed by the request's camelCase path (e.g. `orderLines.0.quantity`). */
  public readonly fieldErrors: Record<string, string>

  constructor(
    message: string,
    public readonly status: number,
    errors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = "ApiError"
    this.fieldErrors = Object.fromEntries(
      Object.entries(errors ?? {}).flatMap(([field, messages]) => (messages[0] ? [[field, messages[0]]] : [])),
    )
  }
}

// The backend answers 400 when an input value fails its validation.
export function isValidationError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 400
}
