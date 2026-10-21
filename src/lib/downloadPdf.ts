import { ApiError } from "@/lib/apiError"

/**
 * GETs a PDF from the backend (through the proxy) and saves it in the browser.
 * The file name comes from the response's Content-Disposition, else `fallbackName`.
 */
export async function downloadPdf(url: string, fallbackName: string, failure: string): Promise<void> {
  const response = await fetch(url, {
    cache: "no-store",
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new ApiError(data?.message || `${failure}: ${response.status}`, response.status)
  }

  const fileName = /filename="?([^";]+)"?/.exec(response.headers.get("content-disposition") ?? "")?.[1] ?? fallbackName
  const objectUrl = URL.createObjectURL(await response.blob())
  const link = document.createElement("a")
  link.href = objectUrl
  link.download = fileName
  link.click()
  // Freed a moment later, once the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}
