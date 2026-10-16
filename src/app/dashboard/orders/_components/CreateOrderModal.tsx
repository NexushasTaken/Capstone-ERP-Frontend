"use client"

import { useEffect, useState } from "react"
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import AppModal, { ModalHeader } from "@/components/AppModal"
import EntityDropdown from "@/components/EntityDropdown"
import { FormField, FormInput } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useInventoryProductSearch } from "@/hooks/useInventoryProductSearch"
import { useOrderTypes } from "@/hooks/useOrderTypes"
import {
  formatDiscount,
  getOrderLineAmountTotal,
  getOrderLineQuantityTotal,
  getOrderLineRows,
  hasStockShortage,
  normalizeOrderText,
} from "@/lib/helpers/orderHelpers"
import type { InsertOrderPayload } from "@/types/order"
import { useDiscounts, useOrderDrivers } from "../_hooks/useOrders"
import { emptyOrder, orderSchema, type OrderFields } from "../_lib/orderSchema"
import ConfirmOrderModal from "./ConfirmOrderModal"
import DiscountFields from "./DiscountFields"
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
  const { data: drivers = [], isLoading: driversLoading } = useOrderDrivers()
  const { data: discounts = [] } = useDiscounts()

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
  const walkinTypeId = orderTypeOptions.find((type) => isWalkinType(type.id))?.id

  const form = useForm<OrderFields>({
    // Walk-in orders skip the driver and address rules, so pick the schema from the values being checked.
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
    setValue,
    formState: { errors, isValid },
  } = form
  const values = useWatch({ control })

  // Order types load async, so walk-in can't be a default value; fill it in once they arrive and after each reset.
  useEffect(() => {
    if (walkinTypeId && !values.orderTypeId) setValue("orderTypeId", walkinTypeId)
  }, [walkinTypeId, values.orderTypeId, setValue])

  const selectedOrderTypeLabel = orderTypeOptions.find((type) => type.id === values.orderTypeId)?.label
  const isWalkin = isWalkinType(values.orderTypeId)
  const driverOptions = drivers.map((driver) => ({
    id: driver.id,
    label: `${driver.firstName} ${driver.lastName}`,
  }))
  const selectedDriverLabel = driverOptions.find((driver) => driver.id === values.deliveryDriverId)?.label ?? ""

  const discountType = discounts.find((discount) => discount.id === values.discountId)?.type
  const lineRows = getOrderLineRows(values.orderLines ?? [], products)
  const totalQuantity = getOrderLineQuantityTotal(lineRows)
  const totalAmount = getOrderLineAmountTotal(lineRows)
  const canSubmit = isValid && !disabled && !hasStockShortage(lineRows)

  const handleConfirm = handleSubmit((order) => {
    onSubmit({
      orderTypeId: order.orderTypeId,
      deliveryDriverId: isWalkin ? 0 : order.deliveryDriverId,
      customerName: order.customerName,
      deliveryAddress: isWalkin ? "" : order.deliveryAddress,
      discountPercent: order.discountPercent,
      discountId: order.discountId,
      orderLines: order.orderLines,
    })
    setIsReviewing(false)
    reset(emptyOrder)
  })

  const reviewDetails = [
    { label: "Order type", value: selectedOrderTypeLabel ?? "-" },
    ...(isWalkin ? [] : [{ label: "Delivery driver", value: selectedDriverLabel || "-" }]),
    { label: "Customer", value: values.customerName || "-" },
    { label: "Quantity", value: totalQuantity },
    { label: "Discount", value: formatDiscount(discountType, values.discountPercent) },
    ...(isWalkin ? [] : [{ label: "Delivery address", value: values.deliveryAddress || "-" }]),
  ]

  return (
    <AppModal
      className="flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-6xl flex-col overflow-hidden lg:max-w-6xl"
      onClose={onClose}
      open={open}
    >
      <ModalHeader className="p-5" title="Create order" onClose={onClose} />

      <FormProvider {...form}>
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

              <FormField label="Customer name" error={errors.customerName?.message}>
                <FormInput aria-invalid={!!errors.customerName} className="capitalize" {...register("customerName")} />
              </FormField>

              <FormField label="Quantity (total items)">
                <Input className="bg-muted/50" readOnly disabled value={totalQuantity} />
                <span className="text-xs text-muted-foreground">Calculated from items below</span>
              </FormField>
            </div>

            <div className="mt-4">
              <DiscountFields />
            </div>

            {!isWalkin && (
              <div className="mt-4">
                <FormField label="Delivery address" error={errors.deliveryAddress?.message}>
                  <FormInput aria-invalid={!!errors.deliveryAddress} {...register("deliveryAddress")} />
                </FormField>
              </div>
            )}
          </div>

          <OrderLinesEditor
            lineRows={lineRows}
            totalAmount={totalAmount}
            discountPercent={values.discountPercent}
            discountType={discountType}
            products={products}
            productsLoading={productsLoading}
            productsError={productsError}
          />
        </div>
      </FormProvider>

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
        discountType={discountType}
        disabled={!canSubmit}
        onBack={() => setIsReviewing(false)}
        onConfirm={handleConfirm}
      />
    </AppModal>
  )
}
