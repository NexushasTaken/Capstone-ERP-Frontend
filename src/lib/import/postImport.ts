import { ApiError } from "@/lib/apiError"
import type { ApiEnvelope } from "@/types/api"

// Shown when the server gives no message of its own (empty body, proxy error page, etc.).
function fallbackMessage(status: number, noun: string) {
  if (status === 400) return "Some rows have problems. Check the highlighted rows."
  if (status === 401) return "Your session has expired. Log in again, then retry the import."
  if (status === 403) return `Only the owner can import ${noun}.`
  if (status === 404) return "The server doesn't support importing yet. Restart or update the backend."
  if (status === 413) return "The file is too large. Split it into smaller files."
  if (status >= 500) return "The server ran into a problem. Nothing was imported. Try again."
  return `Couldn't import ${noun} (error ${status}).`
}

/**
 * Posts `{ rows }` to an import (or import check) endpoint and returns the response content
 * (the import's added count). Always throws an ApiError with a readable message;
 * a 400 also carries the `rows.N.<field>` errors.
 */
export async function postImport<T, R = number>(url: string, rows: T[], noun: string): Promise<R> {
  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ rows }),
    })
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0)
  }

  // An empty or non-JSON body (e.g. a 404 from an old backend) must not surface as a JSON parse error.
  const data: ApiEnvelope<R> | null = await response.json().catch(() => null)

  if (!response.ok || !data?.success) {
    throw new ApiError(data?.message || fallbackMessage(response.status, noun), response.status, data?.errors)
  }

  return data.content
}
