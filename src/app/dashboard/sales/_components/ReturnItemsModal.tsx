"use client"

import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import AppModal, { ModalHeader } from "@/components/AppModal"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { formatPeso } from "@/lib/format"
import { formatSaleId } from "@/lib/helpers/saleHelpers"
import type { Sale, SaleReturnPayload } from "@/types/sale"
import { previewRefund, saleReturnSchema, type SaleReturnFormValues } from "../_lib/saleReturnSchema"

const conditionOptions = [
  { value: 1, label: "Good (back to stock)" },
  { value: 2, label: "Damaged" },
]

interface ReturnItemsModalProps {
  sale: Sale
  isPending: boolean
  onClose: () => void
  onSubmit: (payload: SaleReturnPayload) => void
}

// Takes back some or all of a sale's products. Stays open while saving; the parent closes it on success.
export default function ReturnItemsModal({ sale, isPending, onClose, onSubmit }: ReturnItemsModalProps) {
  const lines = sale.orders.filter((line) => line.quantity > line.returnedQuantity)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SaleReturnFormValues>({
    resolver: zodResolver(saleReturnSchema(sale)),
    mode: "onChange",
    defaultValues: {
      items: lines.map((line) => ({ productId: line.productId, quantity: 0, conditionId: 1 as const })),
      reason: "",
    },
  })
  const { fields } = useFieldArray({ control, name: "items" })
  const items = useWatch({ control, name: "items" })
  const refund = previewRefund(sale, items ?? [])
  const close = () => {
    if (!isPending) onClose()
  }

  return (
    <AppModal open onClose={close} className="flex max-h-[90vh] flex-col lg:max-w-3xl">
      <ModalHeader title="Return items" detail={formatSaleId(sale.id)} onClose={close} />
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={handleSubmit((values) => {
          if (isPending) return
          onSubmit({
            saleId: sale.id,
            reason: values.reason.trim(),
            items: values.items.filter((item) => item.quantity > 0),
          })
        })}
      >
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-4">
          <p className="text-sm text-muted-foreground">
            Enter how many of each product the customer brought back. Leave 0 for products they kept.
          </p>

          <div className="overflow-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Products to return</caption>
              <thead className="bg-muted text-xs text-muted-foreground">
                <tr>
                  {["Product", "Sold", "Returned", "Return qty", "Condition"].map((column) => (
                    <th key={column} scope="col" className="px-3 py-2 font-normal">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const line = lines[index]
                  const error = errors.items?.[index]?.quantity?.message
                  return (
                    <tr key={field.id} className="border-t border-border align-top">
                      <td className="px-3 py-3 capitalize">{line.productName}</td>
                      <td className="px-3 py-3">{line.quantity}</td>
                      <td className="px-3 py-3">{line.returnedQuantity}</td>
                      <td className="px-3 py-2">
                        <Input
                          aria-label={`Return quantity for ${line.productName}`}
                          aria-invalid={!!error}
                          className="w-24"
                          type="number"
                          min={0}
                          max={line.quantity - line.returnedQuantity}
                          step={1}
                          disabled={isPending}
                          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        />
                        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
                      </td>
                      <td className="px-3 py-2">
                        <Controller
                          control={control}
                          name={`items.${index}.conditionId`}
                          render={({ field: condition }) => (
                            <Select
                              items={conditionOptions}
                              value={condition.value}
                              disabled={isPending}
                              onValueChange={(value) => {
                                if (value === 1 || value === 2) condition.onChange(value)
                              }}
                            >
                              <SelectTrigger
                                aria-label={`Condition of ${line.productName}`}
                                className="w-full min-w-44"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {conditionOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {errors.items?.root?.message || errors.items?.message ? (
            <p className="text-xs text-destructive">{errors.items?.root?.message ?? errors.items?.message}</p>
          ) : null}

          <FormField label="Reason" error={errors.reason?.message}>
            <Textarea
              aria-invalid={!!errors.reason}
              disabled={isPending}
              className="h-24 min-h-24 max-h-24 resize-none field-sizing-fixed overflow-y-auto"
              {...register("reason")}
            />
          </FormField>

          <p className="text-sm text-muted-foreground">
            Refund: <span className="font-medium text-foreground">{formatPeso(refund)}</span>
            {sale.discountPercent > 0 ? ` (after the ${sale.discountPercent}% order discount)` : null}
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
              "Record return"
            )}
          </Button>
        </div>
      </form>
    </AppModal>
  )
}
