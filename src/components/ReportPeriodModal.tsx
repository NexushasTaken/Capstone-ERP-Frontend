"use client"

import { useState } from "react"
import { endOfWeek, format, isAfter, isSameYear, parseISO, startOfWeek } from "date-fns"
import { Download } from "lucide-react"

import AppModal, { ModalActions, ModalBody, ModalHeader } from "@/components/AppModal"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useReportDownload } from "@/hooks/useReportDownload"
import type { ReportPeriod } from "@/types/report"

interface ReportPeriodModalProps {
  open: boolean
  onClose: () => void
  /** e.g. "Export sales report" */
  title: string
  /** What each period's PDF lists, shown under the buttons. */
  hints: Record<ReportPeriod, string>
  /** First and last day with data ("yyyy-MM-dd"); limits the calendar when known. */
  range?: { first: string | null; last: string | null }
  /** Builds and saves the PDF for the period around `date` ("yyyy-MM-dd"). */
  onDownload: (period: ReportPeriod, date: string) => Promise<void>
}

const periods: { value: ReportPeriod; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

// The days the report covers, the same rule the backend uses.
function coveredLabel(period: ReportPeriod, day: Date) {
  if (period === "daily") return format(day, "EEEE, MMM d, yyyy")
  if (period === "monthly") return format(day, "MMMM yyyy")

  const start = startOfWeek(day, { weekStartsOn: 1 })
  const end = endOfWeek(day, { weekStartsOn: 1 })
  return `${format(start, isSameYear(start, end) ? "MMM d" : "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`
}

// Pick Daily / Weekly / Monthly and a day, then download that report as a PDF.
export default function ReportPeriodModal({ open, onClose, title, hints, range, onDownload }: ReportPeriodModalProps) {
  const [period, setPeriod] = useState<ReportPeriod>("daily")
  const [picked, setPicked] = useState<Date | undefined>()
  const download = useReportDownload()

  const firstDay = range?.first ? parseISO(range.first) : undefined
  const lastDay = range?.last ? parseISO(range.last) : undefined
  // Today, unless it's past the last day with data; then that day.
  const today = new Date()
  const day = picked ?? (lastDay && isAfter(today, lastDay) ? lastDay : today)

  return (
    <AppModal open={open} onClose={onClose} className="lg:max-w-md">
      <ModalHeader title={title} onClose={onClose} />
      <ModalBody>
        <div className="grid grid-cols-3 gap-2">
          {periods.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={option.value === period ? "default" : "outline"}
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{hints[period]}</p>

        <div className="flex justify-center rounded-lg border">
          <Calendar
            mode="single"
            required
            weekStartsOn={1}
            captionLayout={firstDay && lastDay ? "dropdown" : "label"}
            startMonth={firstDay}
            endMonth={lastDay}
            selected={day}
            onSelect={setPicked}
            defaultMonth={day}
          />
        </div>

        <p className="text-sm">
          <span className="text-muted-foreground">Report covers </span>
          <span className="font-medium text-foreground">{coveredLabel(period, day)}</span>
        </p>
      </ModalBody>
      <ModalActions
        onCancel={onClose}
        onConfirm={() => download.mutate(() => onDownload(period, format(day, "yyyy-MM-dd")))}
        confirmLabel={download.isPending ? "Preparing…" : "Download PDF"}
        confirmIcon={Download}
        confirmDisabled={download.isPending}
      />
    </AppModal>
  )
}
