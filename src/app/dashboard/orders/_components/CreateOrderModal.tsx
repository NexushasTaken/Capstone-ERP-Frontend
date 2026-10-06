"use client"

import { useState } from "react"
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import AppModal, { ModalTitle } from "@/components/AppModal"
import CloseButton from "@/components/CloseButton"
import EntityDropdown from "@/components/EntityDropdown"
import { FormField, FormInput } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useInventoryProductSearch } from "@/hooks/useInventoryProductSearch"
import { useOrderTypes } from "@/hooks/useOrderTypes"
import {
  getOrderLineAmountTotal,
  getOrderLineQuantityTotal,
  getOrderLineRows,
  normalizeOrderText,
} from "@/lib/helpers/orderHelpers"
import type { InsertOrderPayload } from "@/types/order"
import { useOrderRiders } from "../_hooks/useOrders"
import { emptyOrder, orderSchema, type OrderFields } from "../_lib/orderSchema"
import ConfirmOrderModal from "./ConfirmOrderModal"
import OrderLinesEditor from "./OrderLinesEditor"

interface CreateOrderModalProps {
  open: boolean
  disabled: boolean
  onClose: () => void
  onSubmit: (payload: InsertOrderPayload) => void
}

/**
 * Two steps: fill in the order, then review and confirm it.
 * Keep this mounted (pass `open`) so a half-filled order survives closing the modal.
 */
export default function CreateOrderModal({ open, disabled, onClose, onSubmit }: CreateOrderModalProps) {
  const [isReviewing, setIsReviewing] = useState(false)

  const { products, isLoading: productsLoading, error: productsError } = useInventoryProductSearch(open)
  const { data: orderTypes = [], isLoading: orderTypesLoading } = useOrderTypes()
  const { data: riders = [], isLoading: ridersLoading } = useOrderRiders()

  const orderTypeOptions = orderTypes.map((orderType) => ({
    id: orderType.id,
    label: normalizeOrderText(orderType.type),
  }))
  const orderTypeSelectItems = orderTypeOptions.map((orderType) => ({
    value: String(orderType.id),
    label: orderType.label,
  }))
  const isWalkinType = (orderTypeId?: number) =>
    orderTypeOptions.find((type) => type.id === orderTypeId)?.label.toLowerCase() === "walkin"

  const form = useForm<OrderFields>({
    // Walk-in orders skip the rider and address rules, so pick the schema from the values being checked.
    resolver: (values, context, options) =>
      zodResolver(orderSchema(isWalkinType(values.orderTypeId)))(values, context, options),
    mode: "onTouched",
    defaultValues: emptyOrder,
  })
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = form
  const values = useWatch({ control })

  const selectedOrderTypeLabel = orderTypeOptions.find((type) => type.id === values.orderTypeId)?.label
  const isWalkin = isWalkinType(values.orderTypeId)
  const riderOptions = riders.map((rider) => ({
    id: rider.id,
    label: `${rider.firstName} ${rider.lastName}`,
  }))
  const selectedRiderLabel = riderOptions.find((rider) => rider.id === values.deliveryRiderId)?.label ?? ""

  const lineRows = getOrderLineRows(values.orderLines ?? [], products)
  const totalQuantity = getOrderLineQuantityTotal(lineRows)
  const totalAmount = getOrderLineAmountTotal(lineRows)
  const canSubmit = isValid && !disabled

  const handleConfirm = handleSubmit((order) => {
    onSubmit({
      orderTypeId: order.orderTypeId,
      deliveryRiderId: isWalkin ? 0 : order.deliveryRiderId,
      customerName: order.customerName,
      pickUpAddress: isWalkin ? "" : order.pickUpAddress,
      deliveryAddress: isWalkin ? "" : order.deliveryAddress,
      discountPercent: order.discountPercent,
      orderLines: order.orderLines,
    })
    setIsReviewing(false)
    reset(emptyOrder)
  })

  const reviewDetails = [
    { label: "Order type", value: selectedOrderTypeLabel ?? "-" },
    ...(isWalkin ? [] : [{ label: "Delivery rider", value: selectedRiderLabel || "-" }]),
    { label: "Customer", value: values.customerName || "-" },
    { label: "Quantity", value: totalQuantity },
    { label: "Discount", value: `${Number(values.discountPercent) || 0}%` },
    ...(isWalkin
      ? []
      : [
          { label: "Pickup address", value: values.pickUpAddress || "-" },
          { label: "Delivery address", value: values.deliveryAddress || "-" },
        ]),
  ]

  return (
    <AppModal
      className="flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-6xl flex-col overflow-hidden lg:max-w-6xl"
      onClose={onClose}
      open={open}
    >
      <div className="flex w-full items-center justify-between gap-4 border-b border-border p-5">
        <div className="flex min-w-0 flex-col">
          <span className="text-xs text-muted-foreground">New order</span>
          <ModalTitle className="text-2xl font-medium tracking-tight text-foreground">Create order</ModalTitle>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        <div className="flex flex-col bg-background">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FormField label="Order type" error={errors.orderTypeId?.message}>
              <Controller
                control={control}
                name="orderTypeId"
                render={({ field }) => (
                  <Select
                    disabled={orderTypesLoading}
                    items={orderTypeSelectItems}
                    onValueChange={(value) => {
                      field.onChange(Number(value ?? 0))
                      field.onBlur()
                    }}
                    value={field.value ? String(field.value) : ""}
                  >
                    <SelectTrigger aria-invalid={!!errors.orderTypeId} className="w-full">
                      <SelectValue placeholder="Select order type" />
                    </SelectTrigger>
                    <SelectContent className="capitalize">
                      {orderTypeOptions.map((orderType) => (
                        <SelectItem key={orderType.id} value={String(orderType.id)} className="capitalize">
                          {orderType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            {!isWalkin && (
              <FormField label="Delivery rider" error={errors.deliveryRiderId?.message}>
                <Controller
                  control={control}
                  name="deliveryRiderId"
                  render={({ field }) => (
                    <EntityDropdown
                      emptyLabel="No riders found."
                      isLoading={ridersLoading}
                      onSelect={field.onChange}
                      options={riderOptions}
                      placeholder="Select delivery rider"
                      searchPlaceholder="Search riders..."
                      value={selectedRiderLabel}
                    />
                  )}
                />
              </FormField>
            )}

            <FormField label="Customer name" error={errors.customerName?.message}>
              <FormInput aria-invalid={!!errors.customerName} className="capitalize" {...register("customerName")} />
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
          />
        </FormProvider>
      </div>

      <div className="flex justify-end gap-2 border-t border-border p-5">
        <Button onClick={onClose} type="button" variant="outline">
          Cancel
        </Button>
        <Button disabled={!canSubmit} onClick={() => setIsReviewing(true)} type="button">
          <Plus className="h-4 w-4" />
          Add order
        </Button>
      </div>

      {/* Nested inside the create dialog so closing the review doesn't close this one too. */}
      <ConfirmOrderModal
        open={isReviewing}
        details={reviewDetails}
        lineRows={lineRows}
        totalAmount={totalAmount}
        discountPercent={values.discountPercent}
        disabled={!canSubmit}
        onBack={() => setIsReviewing(false)}
        onConfirm={handleConfirm}
      />
    </AppModal>
  )
}
