"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { downloadSalesReport } from "@/services/saleApi"
import type { SalesReportPeriod } from "@/types/sale"

// Builds the sales report PDF on the backend and saves it in the browser.
export function useSalesReportDownload() {
  return useMutation({
    mutationFn: ({ period, date }: { period: SalesReportPeriod; date: string }) => downloadSalesReport(period, date),
    onError: (error) => toast.error(error.message || "Failed to export the sales report"),
  })
}
