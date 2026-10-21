"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PackageCheck } from "lucide-react"
import { toast } from "sonner"
import AppModal, { ModalActions, ModalHeader } from "@/components/AppModal"
import { Input } from "@/components/ui/input"
import { applyServerErrors } from "@/lib/applyServerErrors"
import { formatPeso, formatQuantity } from "@/lib/format"
import type { Purchase, ReceivePurchasePayload } from "@/types/purchase"
import { formatPurchaseId, formatSupplier } from "../_lib/purchaseHelpers"
import { receiveSchema, type ReceiveFormValues } from "../_lib/purchaseSchema"

interface ReceivePurchaseModalProps {
  purchase: Purchase
  isPending: boolean
  onClose: () => void
  onSubmit: (payload: ReceivePurchasePayload) => Promise<unknown>
}

// One step: each line starts at the ordered quantity and can be lowered if the supplier sent less.
// Stock goes up by what arrived; after this the purchase is locked.
export default function ReceivePurchaseModal({ purchase, isPending, onClose, onSubmit }: ReceivePurchaseModalProps) {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<ReceiveFormValues>({
    resolver: zodResolver(receiveSchema(purchase)),
    mode: "onChange",
    defaultValues: { lines: purchase.lines.map((line) => ({ quantity: line.quantity })) },
  })
  const lines = useWatch({ control, name: "lines" }) ?? []
  const receivedTotal = purchase.lines.reduce((sum, line, index) => {
    const quantity = lines[index]?.quantity
    return sum + (Number.isFinite(quantity) ? quantity : 0) * line.unitCost
  }, 0)
  const close = () => {
    if (!isPending) onClose()
  }

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit({
        id: purchase.id,
        lines: purchase.lines.map((line, index) => ({
          productId: line.productId,
          quantity: values.lines[index].quantity,
        })),
      })
      onClose()
    } catch (error) {
      if (!applyServerErrors(error, setError)) {
        toast.error(error instanceof Error ? error.message : "Failed to receive purchase")
      }
    }
  })

  return (
    <AppModal className="flex max-h-[90vh] flex-col lg:max-w-3xl" onClose={close} open>
      <ModalHeader
        title="Receive purchase"
        detail={`${formatPurchaseId(purchase.id)} · ${formatSupplier(purchase.supplierName)}`}
        onClose={close}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground">
          Enter what actually arrived. Lower a line if the supplier sent less; the rest won&apos;t come later. Once
          received, the purchase can&apos;t be changed (fix a miscount with a count correction in Inventory).
        </p>
        <div className="overflow-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Ordered</th>
                <th className="px-3 py-2 font-medium">Arrived</th>
              </tr>
            </thead>
            <tbody>
              {purchase.lines.map((line, index) => {
                const error = errors.lines?.[index]?.quantity?.message
                return (
                  <tr key={line.productId} className="border-t border-border align-top">
                    <td className="px-3 py-3 capitalize">{line.productName}</td>
                    <td className="whitespace-nowrap px-3 py-3">{formatQuantity(line.quantity, line.unit)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Input
                          aria-invalid={!!error}
                          aria-label={`Arrived of ${line.productName}`}
                          className="w-24"
                          disabled={isPending}
                          max={line.quantity}
                          min={0}
                          step={1}
                          type="number"
                          {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                        />
                        {line.unit && <span className="text-muted-foreground">{line.unit}</span>}
                      </div>
                      {error && <span className="text-xs text-destructive">{error}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {(errors.lines?.root?.message || errors.lines?.message || errors.root?.server) && (
          <span className="text-sm text-destructive">
            {errors.lines?.root?.message ?? errors.lines?.message ?? errors.root?.server?.message}
          </span>
        )}
        <p className="text-sm text-muted-foreground">
          Cost of what arrived: <span className="font-medium text-foreground">{formatPeso(receivedTotal)}</span>{" "}
          (ordered {formatPeso(purchase.total)})
        </p>
      </div>
      <ModalActions
        onCancel={close}
        onConfirm={submit}
        confirmLabel={isPending ? "Saving..." : "Receive into stock"}
        confirmIcon={PackageCheck}
        confirmDisabled={!isValid || isPending}
      />
    </AppModal>
  )
}
