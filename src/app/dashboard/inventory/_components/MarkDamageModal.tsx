"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import AppModal, { ModalHeader } from "@/components/AppModal"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatInventoryId, formatNumber } from "@/lib/helpers/inventoryHelpers"
import type { InventoryListItem, MarkInventoryAsDamagePayload } from "@/types/inventory"
import { damageSchema, type DamageFormValues } from "../_lib/inventorySchema"

interface MarkDamageModalProps {
  item: InventoryListItem
  isPending: boolean
  onClose: () => void
  onSubmit: (payload: MarkInventoryAsDamagePayload) => void
}

// Damaged stock is taken out of the quantity on hand. Damaged customer returns are recorded from the sale.
export default function MarkDamageModal({ item, isPending, onClose, onSubmit }: MarkDamageModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DamageFormValues>({
    resolver: zodResolver(damageSchema(item.quantity)),
    mode: "onTouched",
    defaultValues: { reason: "" },
  })
  const close = () => {
    if (!isPending) onClose()
  }

  return (
    <AppModal open onClose={close} className="flex max-h-fit flex-col lg:max-w-lg">
      <ModalHeader title="Mark as damage" detail={formatInventoryId(String(item.id))} onClose={close} />
      <form
        onSubmit={handleSubmit((values) => {
          if (isPending) return
          onSubmit({ id: item.id, ...values, created_At: new Date().toISOString() })
        })}
      >
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm text-muted-foreground">
            {item.name} · {formatNumber(item.quantity)} available. Damaged quantity will be deducted from stock.
          </p>
          <FormField label="Quantity" error={errors.quantity?.message}>
            <Input
              aria-invalid={!!errors.quantity}
              type="number"
              min={1}
              max={item.quantity}
              step={1}
              disabled={isPending}
              {...register("quantity", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Reason" error={errors.reason?.message}>
            <Textarea
              aria-invalid={!!errors.reason}
              disabled={isPending}
              className="h-28 min-h-28 max-h-28 resize-none field-sizing-fixed overflow-y-auto"
              {...register("reason")}
            />
          </FormField>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button type="button" variant="outline" disabled={isPending} onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="destructive" disabled={!isValid || isPending}>
            {isPending ? "Saving..." : "Mark as damage"}
          </Button>
        </div>
      </form>
    </AppModal>
  )
}
