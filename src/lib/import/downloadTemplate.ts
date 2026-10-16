// Downloads a CSV with only the header row, for the user to fill in.
export function downloadTemplate(fileName: string, headers: string[]) {
  const blob = new Blob([headers.join(",") + "\n"], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  // Freed a moment later, once the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
