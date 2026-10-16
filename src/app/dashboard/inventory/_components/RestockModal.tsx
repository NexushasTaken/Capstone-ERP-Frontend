"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import AppModal, { ModalHeader } from "@/components/AppModal"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { formatInventoryId, formatNumber } from "@/lib/helpers/inventoryHelpers"
import type { InventoryListItem, RestockInventoryPayload } from "@/types/inventory"
import { restockSchema, type RestockFormValues } from "../_lib/inventorySchema"

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
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RestockFormValues>({
    resolver: zodResolver(restockSchema),
    mode: "onTouched",
  })
  const close = () => {
    if (!isPending) onClose()
  }

  return (
    <AppModal open onClose={close} className="flex max-h-fit flex-col lg:max-w-lg">
      <ModalHeader title="Restock inventory" detail={formatInventoryId(String(item.id))} onClose={close} />
      <form
        onSubmit={handleSubmit((values) => {
          if (!isPending) onSubmit({ id: item.id, ...values })
        })}
      >
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm text-muted-foreground">
            {item.name} · {formatNumber(item.quantity)} available. Customer returns are recorded from the sale in Sales.
          </p>
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
