"use client"

import { useState } from "react"
import AppModal, { ModalHeader } from "@/components/AppModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { formatInventoryId, formatNumber } from "@/lib/helpers/inventoryHelpers"
import type { InventoryListItem, RestockInventoryPayload } from "@/types/inventory"

const restockTypeOptions = [
  { value: 1, label: "Increase Stock" },
  { value: 2, label: "Return Stock" },
]

interface RestockModalProps {
  item: InventoryListItem
  isPending: boolean
  onClose: () => void
  onSubmit: (payload: RestockInventoryPayload) => void
}

// Stays open while saving; the parent closes it once the restock succeeds.
export default function RestockModal({ item, isPending, onClose, onSubmit }: RestockModalProps) {
  const [form, setForm] = useState<{ quantity: string; restockType: 1 | 2 }>({
    quantity: "",
    restockType: 1,
  })
  const quantity = Number(form.quantity)
  const canSubmit = item.id > 0 && Number.isSafeInteger(quantity) && quantity > 0
  const close = () => {
    if (!isPending) onClose()
  }

  return (
    <AppModal open onClose={close} className="flex max-h-fit flex-col lg:max-w-lg">
      <ModalHeader subtitle={formatInventoryId(String(item.id))} title="Restock inventory" onClose={close} />
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!canSubmit || isPending) return
          onSubmit({ id: item.id, quantity, restockType: form.restockType })
        }}
      >
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm text-muted-foreground">
            {item.name} · {formatNumber(item.quantity)} available.
          </p>
          <div className="flex flex-col gap-1 text-sm text-foreground">
            <label htmlFor="restock-type" className="text-xs text-muted-foreground">
              Restock type
            </label>
            <Select
              items={restockTypeOptions}
              value={form.restockType}
              disabled={isPending}
              onValueChange={(value) => {
                if (value === 1 || value === 2) setForm((previous) => ({ ...previous, restockType: value }))
              }}
            >
              <SelectTrigger id="restock-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {restockTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex flex-col gap-1 text-sm text-foreground">
            <span className="text-xs text-muted-foreground">Quantity</span>
            <Input
              required
              type="number"
              min={1}
              step={1}
              disabled={isPending}
              value={form.quantity}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  quantity: event.target.value,
                }))
              }
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button type="button" variant="outline" disabled={isPending} onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit || isPending}>
            {isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                Saving...
              </>
            ) : (
              "Restock"
            )}
          </Button>
        </div>
      </form>
    </AppModal>
  )
}
