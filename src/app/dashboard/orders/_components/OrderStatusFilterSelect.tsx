'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOrderStatusCounts } from '../_hooks/useOrders'

interface OrderStatusFilterSelectProps {
  /** Selected status id as a string, or '' for "All statuses". */
  value: string
  onChange: (statusId: string) => void
  statusOptions: { id: number; label: string }[]
  disabled: boolean
}

// Status filter with the number of orders in each status next to it. "Completed" is left out.
export default function OrderStatusFilterSelect({ value, onChange, statusOptions, disabled }: OrderStatusFilterSelectProps) {
  const { data: statusCounts, isError: statusCountsError } = useOrderStatusCounts()
  const items = [
    { value: 'all', label: 'All statuses' },
    ...statusOptions
      .filter((status) => status.label.toLowerCase() !== 'completed')
      .map((status) => ({ value: String(status.id), label: status.label })),
  ]

  function countFor(label: string) {
    if (!statusCounts || statusCountsError) return '-'
    const match = statusCounts.find((item) => item.status.trim().toLowerCase() === label.toLowerCase())
    return (match?.count ?? 0).toLocaleString()
  }

  return (
    <div className="w-48">
      <Select
        disabled={disabled}
        items={items}
        onValueChange={(next) => onChange(next === 'all' ? '' : String(next ?? ''))}
        value={value || 'all'}
      >
        <SelectTrigger aria-label="Filter orders by status" className="h-10 w-full rounded-xl border-border bg-background px-3 text-sm focus-visible:border-ring focus-visible:ring-ring/50">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {items.map((status) => (
            <SelectItem key={status.value} value={status.value} className="capitalize">
              <span className="flex items-center gap-3 w-full justify-between">
                <span>{status.label}</span>
                {status.value !== 'all' && (
                  <span className="shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                    {countFor(status.label)}
                  </span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
