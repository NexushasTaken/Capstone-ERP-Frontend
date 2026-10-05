"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface CountFilterOption {
  value: string
  label: string
  /** Shown after the label, e.g. "Low stock (12)". Left out while unknown. */
  count?: number
}

interface CountFilterSelectProps {
  options: CountFilterOption[]
  value: string
  onChange: (value: string) => void
  "aria-label": string
}

// Dropdown for a one-of-many list filter, with the number of rows in each option.
export default function CountFilterSelect({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: CountFilterSelectProps) {
  const items = options.map((option) => ({
    value: option.value,
    label: option.count === undefined ? option.label : `${option.label} (${option.count.toLocaleString()})`,
  }))

  return (
    <div className="w-48">
      <Select items={items} onValueChange={(next) => onChange(String(next ?? value))} value={value}>
        <SelectTrigger aria-label={ariaLabel} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
