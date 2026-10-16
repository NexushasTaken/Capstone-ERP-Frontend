"use client"

import { useState } from "react"
import { endOfWeek, format, isAfter, isSameYear, parseISO, startOfWeek } from "date-fns"
import { Download } from "lucide-react"

import AppModal, { ModalActions, ModalBody, ModalHeader } from "@/components/AppModal"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import type { SalesReportPeriod } from "@/types/sale"
import { useSaleDateRange } from "../_hooks/useSaleDateRange"
import { useSalesReportDownload } from "../_hooks/useSalesReportDownload"

interface SalesReportModalProps {
  open: boolean
  onClose: () => void
}

const periods: { value: SalesReportPeriod; label: string; hint: string }[] = [
  { value: "daily", label: "Daily", hint: "Every sale of the day" },
  { value: "weekly", label: "Weekly", hint: "One row per day, Monday to Sunday" },
  { value: "monthly", label: "Monthly", hint: "One row per week of the month" },
]

// The days the report covers, the same rule the backend uses.
function coveredLabel(period: SalesReportPeriod, day: Date) {
  if (period === "daily") return format(day, "EEEE, MMM d, yyyy")
  if (period === "monthly") return format(day, "MMMM yyyy")

  const start = startOfWeek(day, { weekStartsOn: 1 })
  const end = endOfWeek(day, { weekStartsOn: 1 })
  return `${format(start, isSameYear(start, end) ? "MMM d" : "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`
}

// Pick Daily / Weekly / Monthly and a day, then download that sales report as a PDF.
export default function SalesReportModal({ open, onClose }: SalesReportModalProps) {
  const [period, setPeriod] = useState<SalesReportPeriod>("daily")
  const [picked, setPicked] = useState<Date | undefined>()
  const { data: range } = useSaleDateRange()
  const download = useSalesReportDownload()

  const firstDay = range?.first ? parseISO(range.first) : undefined
  const lastDay = range?.last ? parseISO(range.last) : undefined
  // Today, unless it's past the last sale; then the last sale's day.
  const today = new Date()
  const day = picked ?? (lastDay && isAfter(today, lastDay) ? lastDay : today)

  return (
    <AppModal open={open} onClose={onClose} className="lg:max-w-md">
      <ModalHeader title="Export sales report" onClose={onClose} />
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
        <p className="text-sm text-muted-foreground">{periods.find((option) => option.value === period)?.hint}</p>

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
        onConfirm={() => download.mutate({ period, date: format(day, "yyyy-MM-dd") })}
        confirmLabel={download.isPending ? "Preparing…" : "Download PDF"}
        confirmIcon={Download}
        confirmDisabled={download.isPending}
      />
    </AppModal>
  )
}
