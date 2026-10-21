"use client"

import { useState, type ReactNode } from "react"
import { Boxes, ChartNoAxesCombined, Download, ShoppingCart, SlidersHorizontal, type LucideIcon } from "lucide-react"
import ListHeader from "@/components/ListHeader"
import ReportPeriodModal from "@/components/ReportPeriodModal"
import SalesReportModal from "@/components/SalesReportModal"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useReportDownload } from "@/hooks/useReportDownload"
import { downloadAdjustmentReport, downloadPurchaseReport, downloadStockReport } from "@/services/reportApi"

type ReportModal = "sales" | "purchases" | "adjustments" | null

// Every PDF report in one place (owner only). Stock on hand downloads straight away; the others ask for a period.
export default function ReportsView() {
  const [modal, setModal] = useState<ReportModal>(null)
  const stockDownload = useReportDownload()
  const closeModal = () => setModal(null)

  return (
    <section className="flex h-dvh w-full flex-col overflow-hidden rounded-2xl bg-background p-4 lg:p-5">
      <ListHeader title="Reports" />

      <div className="mt-5 grid min-h-0 flex-1 auto-rows-min grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2">
        <ReportCard
          icon={ChartNoAxesCombined}
          title="Sales"
          description="Completed sales with discounts and refunds, by day, week or month, plus the top products."
          period="Daily, weekly or monthly"
        >
          <Button onClick={() => setModal("sales")} type="button" variant="outline">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </ReportCard>

        <ReportCard
          icon={Boxes}
          title="Stock on hand"
          description="Every item's stock, reorder point and status, with critical and low stock first."
          period="As of now"
        >
          <Button
            disabled={stockDownload.isPending}
            onClick={() => stockDownload.mutate(downloadStockReport)}
            type="button"
            variant="outline"
          >
            {stockDownload.isPending ? <Spinner data-icon="inline-start" /> : <Download className="h-4 w-4" />}
            {stockDownload.isPending ? "Preparing…" : "Export PDF"}
          </Button>
        </ReportCard>

        <ReportCard
          icon={ShoppingCart}
          title="Purchases"
          description="Purchases received from suppliers: what arrived, short deliveries, lead time and cost."
          period="Daily, weekly or monthly"
        >
          <Button onClick={() => setModal("purchases")} type="button" variant="outline">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </ReportCard>

        <ReportCard
          icon={SlidersHorizontal}
          title="Adjustments"
          description="Stock adjustments by reason (damaged, lost, found, count corrections), with damaged customer returns marked."
          period="Daily, weekly or monthly"
        >
          <Button onClick={() => setModal("adjustments")} type="button" variant="outline">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </ReportCard>
      </div>

      {modal === "sales" && <SalesReportModal onClose={closeModal} />}

      {modal === "purchases" && (
        <ReportPeriodModal
          open
          onClose={closeModal}
          title="Export purchases report"
          hints={{
            daily: "Purchases received that day",
            weekly: "Purchases received Monday to Sunday",
            monthly: "Purchases received in the month",
          }}
          onDownload={downloadPurchaseReport}
        />
      )}

      {modal === "adjustments" && (
        <ReportPeriodModal
          open
          onClose={closeModal}
          title="Export adjustments report"
          hints={{
            daily: "Adjustments made that day",
            weekly: "Adjustments made Monday to Sunday",
            monthly: "Adjustments made in the month",
          }}
          onDownload={downloadAdjustmentReport}
        />
      )}
    </section>
  )
}

interface ReportCardProps {
  icon: LucideIcon
  title: string
  description: string
  period: string
  children: ReactNode
}

function ReportCard({ icon: Icon, title, description, period, children }: ReportCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-5 w-5 text-foreground" />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-base font-medium text-foreground">{title}</span>
          <span className="text-sm text-muted-foreground">{description}</span>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{period}</span>
        {children}
      </div>
    </div>
  )
}
