'use client'

import * as React from 'react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'

interface DatePickerSimpleProps {
  value: string
  onChange: (value: string) => void
  label?: string
  minDate?: Date
  maxDate?: Date
}

export function DatePickerSimple({ value, onChange, label = 'Date', minDate, maxDate }: DatePickerSimpleProps) {
  const id = React.useId()
  const [open, setOpen] = React.useState(false)
  const date = value ? new Date(value + 'T00:00:00') : undefined

  return (
    <Field className="w-full gap-1">
      <FieldLabel htmlFor={id} className="text-xs font-normal text-muted-foreground">
        {label}
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" id={id} className="h-10 w-full justify-start font-normal">
              {date ? (
                format(date, 'PPP')
              ) : (
                <span className="flex w-full justify-between items-center">
                  Pick a date
                  <CalendarIcon className="transition-all group-hover:scale-105" />
                </span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            startMonth={minDate}
            endMonth={maxDate}
            disabled={[...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])]}
            selected={date}
            onSelect={(selectedDate) => {
              onChange(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '')
              setOpen(false)
            }}
            defaultMonth={date}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
