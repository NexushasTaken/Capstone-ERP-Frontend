"use client"

import { Controller, FormProvider, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save } from "lucide-react"
import AppModal, { ModalHeader } from "@/components/AppModal"
import EntityDropdown from "@/components/EntityDropdown"
import { FormField, FormInput } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useInventoryProductSearch } from "@/hooks/useInventoryProductSearch"
import { applyServerErrors } from "@/lib/applyServerErrors"
import {
  formatOrderNumber,
  getOrderLineAmountTotal,
  getOrderLineQuantityTotal,
  getOrderLineRows,
  normalizeOrderText,
} from "@/lib/helpers/orderHelpers"
import type { OrderGroup, UpdateOrderPayload } from "@/types/order"
import { useOrderDrivers } from "../_hooks/useOrders"
import { editOrderSchema, type OrderFields } from "../_lib/orderSchema"
import OrderLinesEditor from "./OrderLinesEditor"

interface EditOrderModalProps {
  order: OrderGroup
  disabled: boolean
  onClose: () => void
  /** Resolves when the backend accepted the edit; rejects with its error otherwise. */
  onSubmit: (payload: UpdateOrderPayload) => Promise<unknown>
}

/**
 * Edits a processing order: items, discount, driver and addresses. Order type and customer stay locked.
 * Render only while open so the fields start from the order each time.
 */
export default function EditOrderModal({ order, disabled, onClose, onSubmit }: EditOrderModalProps) {
  const isWalkin = normalizeOrderText(order.orderType).toLowerCase() === "walkin"

  const { products, isLoading: productsLoading, error: productsError } = useInventoryProductSearch(true)
  const { data: drivers = [], isLoading: driversLoading } = useOrderDrivers()

  const form = useForm<OrderFields>({
    resolver: zodResolver(editOrderSchema(isWalkin)),
    mode: "onTouched",
    defaultValues: {
      orderTypeId: 0,
      deliveryDriverId: order.deliveryDriverId ?? 0,
      customerName: order.customerName,
      pickUpAddress: order.pickUpAddress ?? "",
      deliveryAddress: order.deliveryAddress ?? "",
      discountPercent: order.discountPercent,
      orderLines: order.orders.map((line) => ({ productId: line.productId, quantity: line.quantity })),
    },
  })
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = form
  const values = useWatch({ control })

  const driverOptions = drivers.map((driver) => ({
    id: driver.id,
    label: `${driver.firstName} ${driver.lastName}`,
  }))
  const selectedDriverLabel = driverOptions.find((driver) => driver.id === values.deliveryDriverId)?.label ?? ""

  const lineRows = getOrderLineRows(values.orderLines ?? [], products)
  const totalQuantity = getOrderLineQuantityTotal(lineRows)
  const totalAmount = getOrderLineAmountTotal(lineRows)
  const heldQuantities = Object.fromEntries(order.orders.map((line) => [line.productId, line.quantity]))
  const canSubmit = isValid && isDirty && !disabled && !isSubmitting

  const handleSave = handleSubmit(async (values) => {
    try {
      await onSubmit({
        orderId: order.orderId,
        deliveryDriverId: isWalkin ? 0 : values.deliveryDriverId,
        pickUpAddress: isWalkin ? "" : values.pickUpAddress,
        deliveryAddress: isWalkin ? "" : values.deliveryAddress,
        discountPercent: values.discountPercent,
        orderLines: values.orderLines,
      })
      onClose()
    } catch (error) {
      // Rejected inputs (e.g. not enough stock) show in the modal; other failures are toasted by the mutation.
      applyServerErrors(error, setError)
    }
  })

  return (
    <AppModal
      className="flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-6xl flex-col overflow-hidden lg:max-w-6xl"
      onClose={onClose}
      open
    >
      <ModalHeader className="p-5" title="Edit order" detail={formatOrderNumber(order.orderId)} onClose={onClose} />

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        <div className="flex flex-col bg-background">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FormField label="Order type">
              <Input className="bg-muted/50 capitalize" readOnly disabled value={normalizeOrderText(order.orderType)} />
            </FormField>

            {!isWalkin && (
              <FormField label="Delivery driver" error={errors.deliveryDriverId?.message}>
                <Controller
                  control={control}
                  name="deliveryDriverId"
                  render={({ field }) => (
                    <EntityDropdown
                      emptyLabel="No drivers found."
                      isLoading={driversLoading}
                      onSelect={field.onChange}
                      options={driverOptions}
                      placeholder="Select delivery driver"
                      searchPlaceholder="Search drivers..."
                      value={selectedDriverLabel}
                    />
                  )}
                />
              </FormField>
            )}

            <FormField label="Customer name">
              <Input className="bg-muted/50 capitalize" readOnly disabled value={order.customerName} />
            </FormField>

            <FormField label="Discount (%)" error={errors.discountPercent?.message}>
              <FormInput
                aria-invalid={!!errors.discountPercent}
                max={100}
                min={0}
                step="any"
                type="number"
                {...register("discountPercent", { valueAsNumber: true })}
              />
              <span className="text-xs text-muted-foreground">Taken off the total of the items below</span>
            </FormField>

            <FormField label="Quantity (total items)">
              <Input className="bg-muted/50" readOnly disabled value={totalQuantity} />
              <span className="text-xs text-muted-foreground">Calculated from items below</span>
            </FormField>
          </div>

          {!isWalkin && (
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FormField label="Pick up address" error={errors.pickUpAddress?.message}>
                <FormInput aria-invalid={!!errors.pickUpAddress} {...register("pickUpAddress")} />
              </FormField>
              <FormField label="Delivery address" error={errors.deliveryAddress?.message}>
                <FormInput aria-invalid={!!errors.deliveryAddress} {...register("deliveryAddress")} />
              </FormField>
            </div>
          )}
        </div>

        <FormProvider {...form}>
          <OrderLinesEditor
            lineRows={lineRows}
            totalAmount={totalAmount}
            discountPercent={values.discountPercent}
            products={products}
            productsLoading={productsLoading}
            productsError={productsError}
            heldQuantities={heldQuantities}
          />
        </FormProvider>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border p-5">
        {errors.root?.server && <p className="mr-auto text-sm text-destructive">{errors.root.server.message}</p>}
        <Button onClick={onClose} type="button" variant="outline">
          Cancel
        </Button>
        <Button disabled={!canSubmit} onClick={handleSave} type="button">
          <Save className="h-4 w-4" />
          Save changes
        </Button>
      </div>
    </AppModal>
  )
}
