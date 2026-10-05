// An error from the backend that keeps the HTTP status, so callers can tell
// a rejected input (400) apart from other failures.
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// The backend answers 400 when an input value fails its validation.
export function isValidationError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 400
}
