"use client"

import ReportPeriodModal from "@/components/ReportPeriodModal"
import { useSaleDateRange } from "@/hooks/useSaleDateRange"
import { downloadSalesReport } from "@/services/saleApi"

// The sales PDF export, opened from the Sales page and the Reports page. The calendar spans the days with sales.
export default function SalesReportModal({ onClose }: { onClose: () => void }) {
  const { data: range } = useSaleDateRange()

  return (
    <ReportPeriodModal
      open
      onClose={onClose}
      title="Export sales report"
      hints={{
        daily: "Every sale of the day",
        weekly: "One row per day, Monday to Sunday",
        monthly: "One row per week of the month",
      }}
      range={range}
      onDownload={downloadSalesReport}
    />
  )
}
