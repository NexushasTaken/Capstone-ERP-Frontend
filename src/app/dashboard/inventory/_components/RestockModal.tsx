"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import AppModal, { ModalHeader } from "@/components/AppModal"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { formatInventoryId, formatNumber } from "@/lib/helpers/inventoryHelpers"
import type { InventoryListItem, RestockInventoryPayload } from "@/types/inventory"
import { restockSchema, type RestockFormValues } from "../_lib/inventorySchema"

const restockTypeOptions = [
  { value: 1, label: "Receive stock" },
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
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RestockFormValues>({
    resolver: zodResolver(restockSchema),
    mode: "onTouched",
    defaultValues: { restockType: 1 },
  })
  const close = () => {
    if (!isPending) onClose()
  }

  return (
    <AppModal open onClose={close} className="flex max-h-fit flex-col lg:max-w-lg">
      <ModalHeader subtitle={formatInventoryId(String(item.id))} title="Restock inventory" onClose={close} />
      <form
        onSubmit={handleSubmit((values) => {
          if (!isPending) onSubmit({ id: item.id, ...values })
        })}
      >
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm text-muted-foreground">
            {item.name} · {formatNumber(item.quantity)} available.
          </p>
          <div className="flex flex-col gap-1 text-sm text-foreground">
            <label htmlFor="restock-type" className="text-xs text-muted-foreground">
              Restock type
            </label>
            <Controller
              control={control}
              name="restockType"
              render={({ field }) => (
                <Select
                  items={restockTypeOptions}
                  value={field.value}
                  disabled={isPending}
                  onValueChange={(value) => {
                    if (value === 1 || value === 2) field.onChange(value)
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
              )}
            />
          </div>
          <FormField label="Quantity" error={errors.quantity?.message}>
            <Input
              aria-invalid={!!errors.quantity}
              type="number"
              min={1}
              step={1}
              disabled={isPending}
              {...register("quantity", { valueAsNumber: true })}
            />
          </FormField>
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
              "Restock"
            )}
          </Button>
        </div>
      </form>
    </AppModal>
  )
}
