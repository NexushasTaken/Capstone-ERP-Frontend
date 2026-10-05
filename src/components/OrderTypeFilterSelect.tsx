'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOrderTypes } from '@/hooks/useOrderTypes'
import { normalizeOrderText } from '@/lib/helpers/orderHelpers'

interface OrderTypeFilterSelectProps {
  /** Selected order type id as a string, or '' for "All types". */
  value: string
  onChange: (orderTypeId: string) => void
}

// "All types" / walk-in / delivery... filter used on the orders and sales pages.
export default function OrderTypeFilterSelect({ value, onChange }: OrderTypeFilterSelectProps) {
  const { data: orderTypes = [], isLoading } = useOrderTypes()
  const items = [
    { value: 'all', label: 'All types' },
    ...orderTypes.map((orderType) => ({
      value: String(orderType.id),
      label: normalizeOrderText(orderType.type),
    })),
  ]

  return (
    <div className="w-48">
      <Select
        disabled={isLoading}
        items={items}
        onValueChange={(next) => onChange(next === 'all' ? '' : String(next ?? ''))}
        value={value || 'all'}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {orderTypes.map((orderType) => (
            <SelectItem key={orderType.id} value={String(orderType.id)} className="capitalize">
              {normalizeOrderText(orderType.type)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
