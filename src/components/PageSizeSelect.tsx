"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAGE_SIZE_OPTIONS } from "@/hooks/usePageSize"

interface PageSizeSelectProps {
  value: number
  onChange: (pageSize: number) => void
}

const items = PAGE_SIZE_OPTIONS.map((size) => ({ value: String(size), label: String(size) }))

// "Rows per page" dropdown shown next to a list's pagination.
export default function PageSizeSelect({ value, onChange }: PageSizeSelectProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Rows</span>
      <Select items={items} onValueChange={(next) => next && onChange(Number(next))} value={String(value)}>
        <SelectTrigger aria-label="Rows per page" className="w-20">
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
