"use client"

import { Controller, useFormContext, useWatch } from "react-hook-form"
import { FormField, FormInput } from "@/components/FormField"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { DISCOUNT_PRESET_RATES, DISCOUNT_TYPE_LABELS, isPresetDiscount } from "@/lib/helpers/orderHelpers"
import { can } from "@/lib/permissions"
import type { DiscountType } from "@/types/order"
import type { OrderFields } from "../_lib/orderSchema"

interface DiscountFieldsProps {
  /** A custom discount the owner set earlier; a secretary may keep it but not change it. */
  ownerCustomDiscount?: boolean
}

// Discount type, percent and ID number for the order forms. Presets fill in their legal rate;
// only the owner may type a custom one. Must be rendered inside the order form's <FormProvider>.
export default function DiscountFields({ ownerCustomDiscount = false }: DiscountFieldsProps) {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<OrderFields>()
  const discountType = useWatch({ control, name: "discountType" })

  const role = useCurrentUser().data?.role
  const canSetCustom = can(role, "order:custom-discount")
  const isLocked = ownerCustomDiscount && !canSetCustom

  const typeOptions = (Object.keys(DISCOUNT_TYPE_LABELS) as DiscountType[]).filter(
    (type) => type !== "custom" || canSetCustom || isLocked,
  )
  const typeSelectItems = typeOptions.map((type) => ({ value: type, label: DISCOUNT_TYPE_LABELS[type] }))

  const handleTypeChange = (type: DiscountType) => {
    const percent = type === "custom" ? 0 : (DISCOUNT_PRESET_RATES[type] ?? 0)
    setValue("discountPercent", percent, { shouldDirty: true, shouldValidate: true })
    setValue("discountIdNumber", "", { shouldDirty: true, shouldValidate: true })
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <FormField label="Discount" error={errors.discountType?.message}>
        <Controller
          control={control}
          name="discountType"
          render={({ field }) => (
            <Select
              disabled={isLocked}
              items={typeSelectItems}
              onValueChange={(value) => {
                const type = (value ?? "none") as DiscountType
                field.onChange(type)
                field.onBlur()
                handleTypeChange(type)
              }}
              value={field.value}
            >
              <SelectTrigger aria-invalid={!!errors.discountType} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {DISCOUNT_TYPE_LABELS[type]}
                    {isPresetDiscount(type) ? ` (${DISCOUNT_PRESET_RATES[type]}%)` : null}
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
          className={discountType === "custom" && !isLocked ? undefined : "bg-muted/50"}
          max={100}
          min={0}
          readOnly={discountType !== "custom" || isLocked}
          step="any"
          type="number"
          {...register("discountPercent", { valueAsNumber: true })}
        />
        <span className="text-xs text-muted-foreground">
          {isPresetDiscount(discountType) ? "Fixed by law" : "Taken off the total of the items below"}
        </span>
      </FormField>

      {isPresetDiscount(discountType) && (
        <FormField label="ID number" error={errors.discountIdNumber?.message}>
          <FormInput
            aria-invalid={!!errors.discountIdNumber}
            placeholder="Senior, PWD or solo parent ID"
            {...register("discountIdNumber")}
          />
        </FormField>
      )}
    </div>
  )
}
