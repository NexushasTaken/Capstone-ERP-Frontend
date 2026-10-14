// Display formatters shared by every page.

export function formatPeso(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

export function formatDate(dateString: string | null) {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/** "1 sale", "1,204 sales". Pass `plural` when it isn't just singular + "s". */
export function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return `${count.toLocaleString("en-PH")} ${count === 1 ? singular : plural}`
}
