'use client'

import { useState } from 'react'
import AppModal, { ModalHeader } from '@/components/AppModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatInventoryId, formatNumber } from '@/lib/helpers/inventoryHelpers'
import type { InventoryListItem, MarkInventoryAsDamagePayload } from '@/types/inventory'

const damageTypeOptions = [
  { value: 1, label: 'Current Item' },
  { value: 2, label: 'Return Item' },
]

interface MarkDamageModalProps {
  item: InventoryListItem
  isPending: boolean
  onClose: () => void
  onSubmit: (payload: MarkInventoryAsDamagePayload) => void
}

// "Current item" damage is taken out of stock; "return item" damage only records a report.
export default function MarkDamageModal({ item, isPending, onClose, onSubmit }: MarkDamageModalProps) {
  const [form, setForm] = useState<{ quantity: string; reason: string; damagedType: 1 | 2 }>({
    quantity: '',
    reason: '',
    damagedType: 1,
  })
  const quantity = Number(form.quantity)
  const canSubmit =
    item.id > 0 &&
    Number.isSafeInteger(quantity) && quantity > 0 &&
    (form.damagedType === 2 || quantity <= item.quantity) &&
    form.reason.trim() !== ''
  const close = () => {
    if (!isPending) onClose()
  }

  return (
    <AppModal open onClose={close} className="flex max-h-fit flex-col lg:max-w-lg">
      <ModalHeader subtitle={formatInventoryId(String(item.id))} title="Mark as damage" onClose={close} />
      <form onSubmit={(event) => {
        event.preventDefault()
        if (!canSubmit || isPending) return
        onSubmit({
          id: item.id,
          damagedType: form.damagedType,
          quantity,
          reason: form.reason.trim(),
          created_At: new Date().toISOString(),
        })
      }}>
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm text-muted-foreground">
            {item.name} · {formatNumber(item.quantity)} available.{' '}
            {form.damagedType === 1 ? 'Damaged quantity will be deducted from stock.' : 'Returned damage does not change current stock.'}
          </p>
          <div className="flex flex-col gap-1 text-sm text-foreground">
            <label htmlFor="damage-type" className="text-xs text-muted-foreground">Damage type</label>
            <Select items={damageTypeOptions} value={form.damagedType} disabled={isPending} onValueChange={(value) => {
              if (value === 1 || value === 2) setForm((previous) => ({ ...previous, damagedType: value }))
            }}>
              <SelectTrigger id="damage-type" className="h-10 w-full rounded-xl border-border bg-background px-3 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {damageTypeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <label className="flex flex-col gap-1 text-sm text-foreground">
            <span className="text-xs text-muted-foreground">Quantity</span>
            <Input
              required
              type="number"
              min={1}
              max={form.damagedType === 1 ? item.quantity : undefined}
              step={1}
              disabled={isPending}
              value={form.quantity}
              onChange={(event) => setForm((previous) => ({ ...previous, quantity: event.target.value }))}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-foreground">
            <span className="text-xs text-muted-foreground">Reason</span>
            <Textarea
              required
              disabled={isPending}
              value={form.reason}
              onChange={(event) => setForm((previous) => ({ ...previous, reason: event.target.value }))}
              className="h-28 min-h-28 max-h-28 resize-none field-sizing-fixed overflow-y-auto rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button type="button" variant="outline" className="rounded-xl border-border px-3 py-2 text-sm" disabled={isPending} onClick={close}>Cancel</Button>
          <Button type="submit" variant="destructive" className="rounded-xl px-3 py-2 text-sm" disabled={!canSubmit || isPending}>
            {isPending ? 'Saving...' : 'Mark as damage'}
          </Button>
        </div>
      </form>
    </AppModal>
  )
}
