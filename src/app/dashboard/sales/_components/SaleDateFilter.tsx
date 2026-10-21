"use client"

import { useState } from "react"
import { endOfMonth, endOfWeek, format, isSameYear, parseISO, startOfMonth, startOfWeek, subDays } from "date-fns"
import { CalendarIcon, Check } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useSaleDateRange } from "@/hooks/useSaleDateRange"

interface SaleDateFilterProps {
  /** First and last day, `yyyy-MM-dd`; "" = no bound. */
  from: string
  to: string
  onChange: (from: string, to: string) => void
  /** Let the calendar run to today, for returns made after the last sale. */
  untilToday?: boolean
}

const ISO_DAY = "yyyy-MM-dd"

// Quick ranges, worked out from today. Weeks run Monday to Sunday.
function getPresets(today = new Date()) {
  const day = (date: Date) => format(date, ISO_DAY)
  const week = { weekStartsOn: 1 } as const

  return [
    { label: "All time", from: "", to: "" },
    { label: "Today", from: day(today), to: day(today) },
    { label: "This week", from: day(startOfWeek(today, week)), to: day(endOfWeek(today, week)) },
    { label: "This month", from: day(startOfMonth(today)), to: day(endOfMonth(today)) },
    { label: "Last 30 days", from: day(subDays(today, 29)), to: day(today) },
  ]
}

// "Oct 15, 2026", "Oct 13 – Oct 19, 2026" or "Dec 29, 2025 – Jan 4, 2026".
function rangeLabel(from: string, to: string) {
  if (!from && !to) return "All time"
  if (!to) return `From ${format(parseISO(from), "MMM d, yyyy")}`
  if (!from) return `Until ${format(parseISO(to), "MMM d, yyyy")}`

  const start = parseISO(from)
  const end = parseISO(to)
  if (from === to) return format(start, "MMM d, yyyy")

  return `${format(start, isSameYear(start, end) ? "MMM d" : "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`
}

// Date range filter for the sales list: preset ranges, or any range picked on the calendar.
export default function SaleDateFilter({ from, to, onChange, untilToday = false }: SaleDateFilterProps) {
  const [open, setOpen] = useState(false)
  // The calendar's selection, applied only on "Apply" so the list doesn't reload on the first click.
  const [draft, setDraft] = useState<DateRange | undefined>()
  const presets = getPresets()
  // The calendar only offers the days between the first and the last sale (or today, for returns).
  const { data: range, isPending: rangePending } = useSaleDateRange()
  const firstDay = range?.first ? parseISO(range.first) : undefined
  const lastDay = untilToday && range?.first ? new Date() : range?.last ? parseISO(range.last) : undefined

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) setDraft(from ? { from: parseISO(from), to: to ? parseISO(to) : undefined } : undefined)
  }

  function apply(nextFrom: string, nextTo: string) {
    onChange(nextFrom, nextTo)
    setOpen(false)
  }

  function applyDraft() {
    if (!draft?.from) return
    apply(format(draft.from, ISO_DAY), format(draft.to ?? draft.from, ISO_DAY))
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" className="h-10 justify-start font-normal">
            <CalendarIcon />
            {rangeLabel(from, to)}
          </Button>
        }
      />

      <PopoverContent align="end" className="w-auto p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col border-b py-2 sm:w-40 sm:border-r sm:border-b-0">
            {presets.map((preset) => {
              const selected = preset.from === from && preset.to === to

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => apply(preset.from, preset.to)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-accent ${
                    selected ? "bg-muted/50 font-medium" : ""
                  }`}
                >
                  <span>{preset.label}</span>
                  {selected && <Check size={16} className="text-foreground" />}
                </button>
              )
            })}
          </div>

          <div className="flex flex-col">
            <Calendar
              mode="range"
              captionLayout={firstDay && lastDay ? "dropdown" : "label"}
              startMonth={firstDay}
              endMonth={lastDay}
              disabled={firstDay && lastDay ? [{ before: firstDay }, { after: lastDay }] : true}
              selected={draft}
              onSelect={setDraft}
              defaultMonth={draft?.from ?? lastDay}
            />
            <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
              <span className="text-xs text-muted-foreground">
                {draft?.from
                  ? rangeLabel(format(draft.from, ISO_DAY), format(draft.to ?? draft.from, ISO_DAY))
                  : firstDay
                    ? "Pick a day or a range"
                    : rangePending
                      ? "Loading…"
                      : "No sales yet"}
              </span>
              <Button type="button" size="sm" disabled={!draft?.from} onClick={applyDraft}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
