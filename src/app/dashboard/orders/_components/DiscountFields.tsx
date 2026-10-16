"use client"

import { Controller, useFormContext, useWatch } from "react-hook-form"
import { FormField, FormInput } from "@/components/FormField"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { formatDiscountOption, isPresetDiscount } from "@/lib/helpers/orderHelpers"
import { can } from "@/lib/permissions"
import { useDiscounts } from "../_hooks/useOrders"
import type { OrderFields } from "../_lib/orderSchema"

interface DiscountFieldsProps {
  /** A custom discount the owner set earlier; a secretary may keep it but not change it. */
  ownerCustomDiscount?: boolean
}

// Discount and percent for the order forms, from the Discounts table. Presets fill in their legal rate;
// only the owner may type a custom one. Must be rendered inside the order form's <FormProvider>.
export default function DiscountFields({ ownerCustomDiscount = false }: DiscountFieldsProps) {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<OrderFields>()
  const discountId = useWatch({ control, name: "discountId" })
  const { data: discounts = [], isLoading } = useDiscounts()

  const role = useCurrentUser().data?.role
  const canSetCustom = can(role, "order:custom-discount")
  const isLocked = ownerCustomDiscount && !canSetCustom

  const options = discounts.filter((discount) => discount.type !== "custom" || canSetCustom || isLocked)
  const selectItems = options.map((discount) => ({ value: String(discount.id), label: formatDiscountOption(discount) }))
  const selected = discounts.find((discount) => discount.id === discountId)
  const isCustom = selected?.type === "custom"

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField label="Discount" error={errors.discountId?.message}>
        <Controller
          control={control}
          name="discountId"
          render={({ field }) => (
            <Select
              disabled={isLoading || isLocked}
              items={selectItems}
              onValueChange={(value) => {
                const discount = discounts.find((d) => d.id === Number(value))
                field.onChange(Number(value ?? 0))
                field.onBlur()
                setValue("discountPercent", discount?.percent ?? 0, { shouldDirty: true, shouldValidate: true })
              }}
              value={field.value ? String(field.value) : ""}
            >
              <SelectTrigger aria-invalid={!!errors.discountId} className="w-full">
                <SelectValue placeholder="Select discount" />
              </SelectTrigger>
              <SelectContent>
                {selectItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {isLocked && <span className="text-xs text-muted-foreground">Set by the owner</span>}
      </FormField>

      <FormField label="Discount (%)" error={errors.discountPercent?.message}>
        <FormInput
          aria-invalid={!!errors.discountPercent}
          className={isCustom && !isLocked ? undefined : "bg-muted/50"}
          max={100}
          min={0}
          readOnly={!isCustom || isLocked}
          step="any"
          type="number"
          {...register("discountPercent", { valueAsNumber: true })}
        />
        <span className="text-xs text-muted-foreground">
          {isPresetDiscount(selected?.type) ? "Fixed by law" : "Taken off the total of the items below"}
        </span>
      </FormField>
    </div>
  )
}
