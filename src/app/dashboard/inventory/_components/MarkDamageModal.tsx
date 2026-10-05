"use client"

import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import AppModal, { ModalHeader } from "@/components/AppModal"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatInventoryId, formatNumber } from "@/lib/helpers/inventoryHelpers"
import type { InventoryListItem, MarkInventoryAsDamagePayload } from "@/types/inventory"
import { damageSchema, type DamageFormValues } from "../_lib/inventorySchema"

const damageTypeOptions = [
  { value: 1, label: "Current Item" },
  { value: 2, label: "Return Item" },
]

interface MarkDamageModalProps {
  item: InventoryListItem
  isPending: boolean
  onClose: () => void
  onSubmit: (payload: MarkInventoryAsDamagePayload) => void
}

// "Current item" damage is taken out of stock; "return item" damage only records a report.
export default function MarkDamageModal({ item, isPending, onClose, onSubmit }: MarkDamageModalProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DamageFormValues>({
    resolver: zodResolver(damageSchema(item.quantity)),
    mode: "onTouched",
    defaultValues: { damagedType: 1, reason: "" },
  })
  const damagedType = useWatch({ control, name: "damagedType" })
  const close = () => {
    if (!isPending) onClose()
  }

  return (
    <AppModal open onClose={close} className="flex max-h-fit flex-col lg:max-w-lg">
      <ModalHeader subtitle={formatInventoryId(String(item.id))} title="Mark as damage" onClose={close} />
      <form
        onSubmit={handleSubmit((values) => {
          if (isPending) return
          onSubmit({ id: item.id, ...values, created_At: new Date().toISOString() })
        })}
      >
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm text-muted-foreground">
            {item.name} · {formatNumber(item.quantity)} available.{" "}
            {damagedType === 1
              ? "Damaged quantity will be deducted from stock."
              : "Returned damage does not change current stock."}
          </p>
          <div className="flex flex-col gap-1 text-sm text-foreground">
            <label htmlFor="damage-type" className="text-xs text-muted-foreground">
              Damage type
            </label>
            <Controller
              control={control}
              name="damagedType"
              // The stock limit only applies to "current item" damage, so re-check quantity on change.
              rules={{ deps: ["quantity"] }}
              render={({ field }) => (
                <Select
                  items={damageTypeOptions}
                  value={field.value}
                  disabled={isPending}
                  onValueChange={(value) => {
                    if (value === 1 || value === 2) field.onChange(value)
                  }}
                >
                  <SelectTrigger id="damage-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {damageTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <FormField label="Quantity" error={errors.quantity?.message}>
            <Input
              aria-invalid={!!errors.quantity}
              type="number"
              min={1}
              max={damagedType === 1 ? item.quantity : undefined}
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
