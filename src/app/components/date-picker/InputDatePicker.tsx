"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

interface DatePickerInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

function toDateValue(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

export function DatePickerInput({ value, onChange, label = 'Date' }: DatePickerInputProps) {
  const id = React.useId()
  const [open, setOpen] = React.useState(false)
  const date = value ? new Date(value + 'T00:00:00') : undefined
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [draft, setDraft] = React.useState<string | null>(null)

  return (
    <Field className="w-full gap-1">
      <FieldLabel htmlFor={id} className="text-xs font-normal text-[#68716C]">{label}</FieldLabel>
      <InputGroup className="h-10 rounded-xl border-[#DFE2E0] bg-white">
        <InputGroupInput
          id={id}
          value={draft ?? formatDate(date)}
          placeholder="Select a date"
          onBlur={() => setDraft(null)}
          onChange={(e) => {
            const text = e.target.value
            const parsed = /^\d{4}-\d{2}-\d{2}$/.test(text) ? new Date(text + 'T00:00:00') : new Date(text)
            setDraft(text)
            onChange(isValidDate(parsed) ? toDateValue(parsed) : '')
            if (isValidDate(parsed)) setMonth(parsed)
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (nextOpen) setMonth(date) }}>
            <PopoverTrigger render={<InputGroupButton type="button" variant="ghost" size="icon-xs" aria-label="Select date"><CalendarIcon /><span className="sr-only">Select date</span></InputGroupButton>} />
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={(date) => {
                  onChange(date ? toDateValue(date) : '')
                  setDraft(null)
                  setOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
