import AppModal, { ModalTitle } from '@/components/AppModal'
import CloseButton from '@/components/CloseButton'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatPeso } from '@/lib/format'
import type { getOrderLineRows } from '@/lib/helpers/orderHelpers'
import DetailItem from './DetailItem'

interface ConfirmOrderModalProps {
  open: boolean
  details: { label: string; value: string | number }[]
  lineRows: ReturnType<typeof getOrderLineRows>
  totalAmount: number
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
      <div className="flex w-full items-center justify-between gap-4 border-b border-[#E2E2E2] p-5">
        <div className="flex flex-col">
          <span className="text-xs text-[#737A76]">Confirm order</span>
          <ModalTitle className="text-2xl font-medium tracking-tight text-[#0c0d0d]">Review order details</ModalTitle>
        </div>
        <CloseButton onClick={onBack} />
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#DFE2E0] p-4 md:grid-cols-2 xl:grid-cols-3">
          {details.map((detail) => (
            <DetailItem key={detail.label} label={detail.label} value={detail.value} />
          ))}
        </div>

        <div className="overflow-auto rounded-xl border border-[#DFE2E0]">
          <Table>
            <TableHeader className="bg-[#F7F8F8]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-14 text-center text-[#121514]">#</TableHead>
                <TableHead className="min-w-72 text-[#121514]">Product</TableHead>
                <TableHead className="w-36 text-center text-[#121514]">Unit price</TableHead>
                <TableHead className="w-36 text-center text-[#121514]">Quantity</TableHead>
                <TableHead className="w-36 text-center text-[#121514]">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineRows.map((line, index) => (
                <TableRow className="hover:bg-[#F7F8F8]" key={`${line.productId}-${index}`}>
                  <TableCell className="text-center font-medium text-[#121514]">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium capitalize text-[#121514]">{line.product?.name ?? '-'}</span>
                      <span className="text-xs text-[#737A76]">ID: {line.product?.id ?? '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-[#121514]">{formatPeso(line.unitPrice)}</TableCell>
                  <TableCell className="text-center font-medium text-[#121514]">{line.quantity}</TableCell>
                  <TableCell className="text-center font-medium text-[#121514]">{formatPeso(line.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="border-t border-[#DFE2E0] bg-white">
              <TableRow className="hover:bg-transparent">
                <TableCell className="text-right text-sm font-semibold uppercase text-[#121514]" colSpan={4}>
                  Total
                </TableCell>
                <TableCell className="text-center text-base font-medium text-[#159947]">
                  {formatPeso(totalAmount)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-5">
        <Button
          className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
          onClick={onBack}
          type="button"
          variant="outline"
        >
          Back
        </Button>
        <Button
          className="rounded-xl px-3 py-2 text-sm"
          disabled={disabled}
          onClick={onConfirm}
          type="button"
        >
          Confirm order
        </Button>
      </div>
    </AppModal>
  )
}
