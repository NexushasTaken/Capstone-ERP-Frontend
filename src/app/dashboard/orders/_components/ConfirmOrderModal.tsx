import AppModal, { ModalHeader } from "@/components/AppModal"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPeso } from "@/lib/format"
import type { getOrderLineRows } from "@/lib/helpers/orderHelpers"
import DetailItem from "@/components/DetailItem"
import OrderTotalRows from "./OrderTotalRows"

interface ConfirmOrderModalProps {
  open: boolean
  details: { label: string; value: string | number }[]
  lineRows: ReturnType<typeof getOrderLineRows>
  /** Sum of the line subtotals, before the discount. */
  totalAmount: number
  discountPercent?: number
  disabled: boolean
  onBack: () => void
  onConfirm: () => void
}

// Second step of creating an order: a read-only summary before it is submitted.
export default function ConfirmOrderModal({
  open,
  details,
  lineRows,
  totalAmount,
  discountPercent,
  disabled,
  onBack,
  onConfirm,
}: ConfirmOrderModalProps) {
  return (
    <AppModal
      className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl flex-col overflow-hidden lg:max-w-4xl"
      onClose={onBack}
      open={open}
    >
      <ModalHeader className="p-5" title="Review order details" onClose={onBack} />

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-border p-4 md:grid-cols-2 xl:grid-cols-3">
          {details.map((detail) => (
            <DetailItem key={detail.label} label={detail.label} value={detail.value} />
          ))}
        </div>

        <div className="overflow-auto rounded-xl border border-border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-14 text-center text-foreground">#</TableHead>
                <TableHead className="min-w-72 text-foreground">Product</TableHead>
                <TableHead className="w-36 text-center text-foreground">Unit price</TableHead>
                <TableHead className="w-36 text-center text-foreground">Quantity</TableHead>
                <TableHead className="w-36 text-center text-foreground">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineRows.map((line, index) => (
                <TableRow className="hover:bg-accent" key={`${line.productId}-${index}`}>
                  <TableCell className="text-center font-medium text-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium capitalize text-foreground">{line.product?.name ?? "-"}</TableCell>
                  <TableCell className="text-center text-foreground">{formatPeso(line.unitPrice)}</TableCell>
                  <TableCell className="text-center font-medium text-foreground">{line.quantity}</TableCell>
                  <TableCell className="text-center font-medium text-foreground">{formatPeso(line.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="border-t border-border bg-background">
              <OrderTotalRows discountPercent={discountPercent} labelColSpan={4} subtotal={totalAmount} />
            </TableFooter>
          </Table>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border p-5">
        <Button onClick={onBack} type="button" variant="outline">
          Back
        </Button>
        <Button disabled={disabled} onClick={onConfirm} type="button">
          Confirm order
        </Button>
      </div>
    </AppModal>
  )
}
