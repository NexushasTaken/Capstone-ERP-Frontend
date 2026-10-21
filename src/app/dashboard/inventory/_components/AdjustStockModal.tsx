"use client"

import { formatQuantity } from "@/lib/format"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import AppModal, { ModalHeader } from "@/components/AppModal"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { formatInventoryId, formatNumber } from "@/lib/helpers/inventoryHelpers"
import type { AdjustInventoryPayload, InventoryListItem } from "@/types/inventory"
import {
  adjustmentChange,
  adjustmentReasons,
  adjustSchema,
  type AdjustFormValues,
  type AdjustmentReasonValue,
} from "../_lib/inventorySchema"

interface AdjustStockModalProps {
  item: InventoryListItem
  isPending: boolean
  onClose: () => void
  onSubmit: (payload: AdjustInventoryPayload) => void
}

// Stock changes with no sale, return or purchase behind them. The reason sets the direction, so the
// quantity is always positive; a count correction takes the counted amount instead.
// Stays open while saving; the parent closes it once the adjustment succeeds.
export default function AdjustStockModal({ item, isPending, onClose, onSubmit }: AdjustStockModalProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustSchema(item.quantity)),
    mode: "onChange",
    defaultValues: { reasonId: 1, note: "" },
  })
  const reasonId = useWatch({ control, name: "reasonId" })
  const quantity = useWatch({ control, name: "quantity" })
  const change = adjustmentChange(reasonId, quantity, item.quantity)
  const isCount = reasonId === 4
  const close = () => {
    if (!isPending) onClose()
  }

  return (
    <AppModal open onClose={close} className="flex max-h-fit flex-col lg:max-w-lg">
      <ModalHeader title="Adjust stock" detail={formatInventoryId(String(item.id))} onClose={close} />
      <form
        onSubmit={handleSubmit((values) => {
          if (isPending) return
          const note = values.note.trim()
          onSubmit({ id: item.id, reasonId: values.reasonId, quantity: values.quantity, note: note || undefined })
        })}
      >
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm text-muted-foreground">
            {item.name} · {formatQuantity(item.quantity, item.unit)} in stock. Supplier deliveries go through Purchases,
            and customer returns through Sales.
          </p>
          <FormField label="Reason" error={errors.reasonId?.message}>
            <Controller
              control={control}
              name="reasonId"
              // the quantity rules depend on the reason, so re-check it
              rules={{ deps: ["quantity"] }}
              render={({ field }) => (
                <Select
                  items={adjustmentReasons}
                  value={field.value}
                  disabled={isPending}
                  onValueChange={(value) => {
                    if (value) field.onChange(value as AdjustmentReasonValue)
                  }}
                >
                  <SelectTrigger aria-label="Reason" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {adjustmentReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField
            label={`${isCount ? "Counted quantity" : "Quantity"}${item.unit ? ` (${item.unit})` : ""}`}
            error={errors.quantity?.message}
          >
            <Input
              aria-invalid={!!errors.quantity}
              type="number"
              min={isCount ? 0 : 1}
              step={1}
              disabled={isPending}
              {...register("quantity", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Note (optional)" error={errors.note?.message}>
            <Textarea
              aria-invalid={!!errors.note}
              disabled={isPending}
              className="h-24 min-h-24 max-h-24 resize-none field-sizing-fixed overflow-y-auto"
              {...register("note")}
            />
          </FormField>
          <p className="text-sm text-muted-foreground">
            Stock: {formatNumber(item.quantity)} →{" "}
            <span className="font-medium text-foreground">{formatQuantity(item.quantity + change, item.unit)}</span>{" "}
            <span className={cn(change < 0 ? "text-destructive" : change > 0 ? "text-green-700" : "")}>
              ({change > 0 ? "+" : ""}
              {formatNumber(change)})
            </span>
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button type="button" variant="outline" disabled={isPending} onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isValid || isPending}>
            {isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                Saving...
              </>
            ) : (
              "Adjust stock"
            )}
          </Button>
        </div>
      </form>
    </AppModal>
  )
}
