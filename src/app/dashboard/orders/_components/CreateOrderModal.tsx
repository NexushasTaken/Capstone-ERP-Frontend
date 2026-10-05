'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AppModal, { ModalTitle } from '@/components/AppModal'
import CloseButton from '@/components/CloseButton'
import EntityDropdown from '@/components/EntityDropdown'
import { FormField, FormInput } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useInventoryProductSearch } from '@/hooks/useInventoryProductSearch'
import { useOrderTypes } from '@/hooks/useOrderTypes'
import {
  getOrderLineAmountTotal,
  getOrderLineQuantityTotal,
  getOrderLineRows,
  normalizeOrderText,
} from '@/lib/helpers/orderHelpers'
import type { InsertOrderPayload, OrderLineForm } from '@/types/order'
import { useOrderRiders } from '../_hooks/useOrders'
import ConfirmOrderModal from './ConfirmOrderModal'
import OrderLinesEditor from './OrderLinesEditor'

const emptyOrderForm = {
  orderTypeId: '',
  deliveryRiderId: '',
  customerName: '',
  pickUpAddress: '',
  deliveryAddress: '',
}
const emptyOrderLines: OrderLineForm[] = [{ productId: '', quantity: '1' }]

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
  const [form, setForm] = useState(emptyOrderForm)
  const [lines, setLines] = useState(emptyOrderLines)

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
  const selectedOrderTypeLabel = orderTypeOptions.find((type) => type.id === Number(form.orderTypeId))?.label
  // Walk-in orders have no rider and no addresses.
  const isWalkin = selectedOrderTypeLabel?.toLowerCase() === 'walkin'
  const riderOptions = riders.map((rider) => ({
    id: rider.id,
    label: `${rider.firstName} ${rider.lastName}`,
  }))
  const selectedRiderLabel = riderOptions.find((rider) => rider.id === Number(form.deliveryRiderId))?.label ?? ''

  const lineRows = getOrderLineRows(lines, products)
  const totalQuantity = getOrderLineQuantityTotal(lineRows)
  const totalAmount = getOrderLineAmountTotal(lineRows)
  const canSubmit =
    !disabled &&
    Number(form.orderTypeId) > 0 &&
    form.customerName.trim() !== '' &&
    (isWalkin || (
      form.deliveryRiderId.trim() !== '' &&
      Number(form.deliveryRiderId) >= 0 &&
      form.pickUpAddress.trim() !== '' &&
      form.deliveryAddress.trim() !== ''
    )) &&
    lines.every((line) => Number(line.productId) > 0 && Number(line.quantity) > 0)

  function updateField(field: keyof typeof emptyOrderForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleConfirm() {
    if (!canSubmit) return

    onSubmit({
      orderTypeId: Number(form.orderTypeId),
      deliveryRiderId: isWalkin ? 0 : Number(form.deliveryRiderId),
      customerName: form.customerName.trim(),
      pickUpAddress: isWalkin ? '' : form.pickUpAddress.trim(),
      deliveryAddress: isWalkin ? '' : form.deliveryAddress.trim(),
      orderLines: lines.map((line) => ({
        productId: Number(line.productId),
        quantity: Number(line.quantity),
      })),
    })
    setIsReviewing(false)
    setForm(emptyOrderForm)
    setLines(emptyOrderLines)
  }

  const reviewDetails = [
    { label: 'Order type', value: selectedOrderTypeLabel ?? '-' },
    ...(isWalkin ? [] : [{ label: 'Delivery rider', value: selectedRiderLabel || '-' }]),
    { label: 'Customer', value: form.customerName || '-' },
    { label: 'Quantity', value: totalQuantity },
    ...(isWalkin
      ? []
      : [
          { label: 'Pickup address', value: form.pickUpAddress || '-' },
          { label: 'Delivery address', value: form.deliveryAddress || '-' },
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
            <FormField label="Order type">
              <Select
                disabled={orderTypesLoading}
                items={orderTypeSelectItems}
                onValueChange={(value) => updateField('orderTypeId', value ?? '')}
                value={form.orderTypeId}
              >
                <SelectTrigger className="w-full">
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
            </FormField>

            {!isWalkin && (
              <FormField label="Delivery rider">
                <EntityDropdown
                  emptyLabel="No riders found."
                  isLoading={ridersLoading}
                  onSelect={(riderId) => updateField('deliveryRiderId', String(riderId))}
                  options={riderOptions}
                  placeholder="Select delivery rider"
                  searchPlaceholder="Search riders..."
                  value={selectedRiderLabel}
                />
              </FormField>
            )}

            <FormField label="Customer name">
              <FormInput
                className="capitalize"
                onChange={(event) => updateField('customerName', event.target.value)}
                value={form.customerName}
              />
            </FormField>

            <FormField label="Quantity (total items)">
              <Input
                className="bg-muted/50"
                readOnly
                disabled
                value={totalQuantity}
              />
              <span className="text-xs text-muted-foreground">Calculated from items below</span>
            </FormField>
          </div>

          {!isWalkin && (
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FormField label="Pick up address">
                <FormInput
                  onChange={(event) => updateField('pickUpAddress', event.target.value)}
                  value={form.pickUpAddress}
                />
              </FormField>
              <FormField label="Delivery address">
                <FormInput
                  onChange={(event) => updateField('deliveryAddress', event.target.value)}
                  value={form.deliveryAddress}
                />
              </FormField>
            </div>
          )}
        </div>

        <OrderLinesEditor
          lines={lines}
          lineRows={lineRows}
          totalAmount={totalAmount}
          products={products}
          productsLoading={productsLoading}
          productsError={productsError}
          onChange={setLines}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-border p-5">
        <Button
          onClick={onClose}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          disabled={!canSubmit}
          onClick={() => setIsReviewing(true)}
          type="button"
        >
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
        disabled={!canSubmit}
        onBack={() => setIsReviewing(false)}
        onConfirm={handleConfirm}
      />
    </AppModal>
  )
}
