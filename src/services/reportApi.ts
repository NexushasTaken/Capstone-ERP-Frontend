import { downloadPdf } from "@/lib/downloadPdf"
import type { ReportPeriod } from "@/types/report"

// The Reports page PDFs. The sales report lives in saleApi (downloadSalesReport).

export function downloadStockReport() {
  return downloadPdf("/api/Report/stock", "stock-on-hand.pdf", "Failed to export the stock report")
}

export function downloadPurchaseReport(period: ReportPeriod, date: string) {
  return downloadPdf(
    `/api/Report/purchases?${new URLSearchParams({ period, date })}`,
    `purchases-${period}-${date}.pdf`,
    "Failed to export the purchases report",
  )
}

export function downloadAdjustmentReport(period: ReportPeriod, date: string) {
  return downloadPdf(
    `/api/Report/adjustments?${new URLSearchParams({ period, date })}`,
    `adjustments-${period}-${date}.pdf`,
    "Failed to export the adjustments report",
  )
}
