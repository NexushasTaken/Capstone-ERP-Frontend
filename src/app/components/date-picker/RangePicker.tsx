"use client"

import * as React from "react"
import { addDays } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { Field } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerWithRange() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 20),
    to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
  })

  return (
    <Field className="mx-auto w-fit">
      <Popover>
        <PopoverTrigger render={
          <button
            aria-label="Calendar"
            type="button"
            className="bg-transparent border-2 border-[#C6C6C7] rounded-xl text-[#0c0d0d] font-medium p-2 cursor-pointer transition-all duration-300 hover:scale-105 group"
          >
            <CalendarIcon className="transition-all group-hover:scale-105" />
          </button>
        } />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
