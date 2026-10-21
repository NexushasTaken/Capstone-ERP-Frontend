"use client"

import { Controller, FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import AppModal, { ModalActions, ModalHeader } from "@/components/AppModal"
import { DatePickerSimple } from "@/components/DatePicker"
import { FormField, FormInput } from "@/components/FormField"
import { Textarea } from "@/components/ui/textarea"
import { useInventoryProductSearch } from "@/hooks/useInventoryProductSearch"
import { applyServerErrors } from "@/lib/applyServerErrors"
import type { Purchase, PurchasePayload } from "@/types/purchase"
import { formatPurchaseId, todayIso } from "../_lib/purchaseHelpers"
import { emptyPurchaseLine, purchaseSchema, type PurchaseFormValues } from "../_lib/purchaseSchema"
import PurchaseLinesEditor from "./PurchaseLinesEditor"

interface PurchaseFormModalProps {
  /** The ordered purchase being edited, or `null` to add a new one. */
  purchase: Purchase | null
  isPending: boolean
  onClose: () => void
  /** Resolves when saved; a rejection's field errors are shown under the fields. */
  onSubmit: (payload: PurchasePayload) => Promise<unknown>
}

// Add and edit share this modal. Render it only while open so the fields start fresh each time.
// Stays open while saving and closes once the server accepts it.
export default function PurchaseFormModal({ purchase, isPending, onClose, onSubmit }: PurchaseFormModalProps) {
  const isEdit = purchase !== null
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    mode: "onTouched",
    defaultValues: purchase
      ? {
          supplierName: purchase.supplierName ?? "",
          orderedOn: purchase.orderedOn,
          note: purchase.note ?? "",
          lines: purchase.lines.map(({ productId, quantity, unitCost }) => ({ productId, quantity, unitCost })),
        }
      : { supplierName: "", orderedOn: todayIso(), note: "", lines: [emptyPurchaseLine] },
  })
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = form
  const { products, isLoading: productsLoading, error: productsError } = useInventoryProductSearch(true)
  const close = () => {
    if (!isPending) onClose()
  }

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit({
        supplierName: values.supplierName.trim() || undefined,
        orderedOn: values.orderedOn,
        note: values.note.trim() || undefined,
        lines: values.lines,
      })
      onClose()
    } catch (error) {
      if (!applyServerErrors(error, setError)) {
        toast.error(error instanceof Error ? error.message : "Failed to save purchase")
      }
    }
  })

  return (
    <AppModal
      className="flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-5xl flex-col overflow-hidden lg:max-w-5xl"
      onClose={close}
      open
    >
      <ModalHeader
        title={isEdit ? "Edit purchase" : "New purchase"}
        detail={isEdit ? formatPurchaseId(purchase.id) : undefined}
        onClose={close}
      />
      <FormProvider {...form}>
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Supplier (optional)" error={errors.supplierName?.message}>
              <FormInput
                aria-invalid={!!errors.supplierName}
                className="capitalize"
                disabled={isPending}
                placeholder="e.g. Acme Hardware"
                {...register("supplierName")}
              />
            </FormField>
            <Controller
              control={control}
              name="orderedOn"
              render={({ field }) => (
                <DatePickerSimple
                  label="Order date"
                  value={field.value}
                  onChange={field.onChange}
                  maxDate={new Date()}
                  error={errors.orderedOn?.message}
                />
              )}
            />
            <div className="md:col-span-2">
              <FormField label="Note (optional)" error={errors.note?.message}>
                <Textarea
                  aria-invalid={!!errors.note}
                  disabled={isPending}
                  className="h-20 min-h-20 max-h-20 resize-none field-sizing-fixed overflow-y-auto"
                  {...register("note")}
                />
              </FormField>
            </div>
          </div>
          <PurchaseLinesEditor
            products={products}
            productsLoading={productsLoading}
            productsError={productsError}
            disabled={isPending}
          />
          {errors.root?.server && <span className="text-sm text-destructive">{errors.root.server.message}</span>}
        </div>
      </FormProvider>
      <ModalActions
        onCancel={close}
        onConfirm={submit}
        confirmLabel={isPending ? "Saving..." : isEdit ? "Save changes" : "Add purchase"}
        confirmIcon={isEdit ? undefined : Plus}
        confirmDisabled={!isValid || isPending}
      />
    </AppModal>
  )
}
