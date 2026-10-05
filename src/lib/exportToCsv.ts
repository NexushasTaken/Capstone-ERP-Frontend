let isExportOnCooldown = false

function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return ""

  return `"${String(value).replace(/"/g, '""')}"`
}

export interface CSVColumn<T> {
  header: string
  value: (row: T) => string | number | boolean | null | undefined
}

export function exportToCSV<T>(rows: T[], columns: CSVColumn<T>[], filename: string): void {
  if (isExportOnCooldown) {
    console.warn("Export is on cooldown.")
    return
  }

  isExportOnCooldown = true

  const csvContent = [
    columns.map((col) => escapeCSVValue(col.header)).join(","),

    ...rows.map((row) => columns.map((col) => escapeCSVValue(col.value(row))).join(",")),
  ].join("\n")

  const blob = new Blob(["\uFEFF", csvContent], {
    type: "text/csv;charset=utf-8;",
  })

  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.href = url
  link.download = `${filename}.csv`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)

  setTimeout(() => {
    isExportOnCooldown = false
  }, 10000)
}
