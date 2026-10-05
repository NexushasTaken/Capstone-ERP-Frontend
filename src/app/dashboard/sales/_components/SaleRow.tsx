import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import { formatDate, formatPeso } from '@/lib/format'
import {
  formatSaleId,
  getSaleCustomerName,
  getSaleProductName,
  getSaleQuantity,
  getSaleStatusLabel,
  saleStatusDotClass,
} from '@/lib/helpers/saleHelpers'
import { normalizeOrderText } from '@/lib/helpers/orderHelpers'
import type { Sale } from '@/types/sale'

interface SaleRowProps {
  sale: Sale
  columnCount: number
  isExpanded: boolean
  onExpandedChange: (expanded: boolean) => void
}

// One sale in the table; "View" expands it to show the details and its products.
export default function SaleRow({ sale, columnCount, isExpanded, onExpandedChange }: SaleRowProps) {
  const statusLabel = getSaleStatusLabel(sale)

  return (
    <Collapsible render={<tbody />} open={isExpanded} onOpenChange={onExpandedChange}>
      <tr className="bg-[#FAFBFA] text-sm text-[#121514]">
        <td className="rounded-l-xl px-3 py-4 font-medium whitespace-nowrap">{formatSaleId(sale.id)}</td>
        <td className="px-3 py-4 font-medium whitespace-nowrap capitalize">{getSaleProductName(sale)}</td>
        <td className="px-3 py-4 whitespace-nowrap capitalize">{normalizeOrderText(sale.orderType)}</td>
        <td className="px-3 py-4 font-medium whitespace-nowrap capitalize">{getSaleCustomerName(sale)}</td>
        <td className="px-3 py-4 text-center">{getSaleQuantity(sale)}</td>
        <td className="px-3 py-4 font-medium whitespace-nowrap">{formatPeso(sale.total)}</td>
        <td className="px-3 py-4 font-medium whitespace-nowrap">{formatDate(sale.created_At)}</td>
        <td className="px-3 py-4 whitespace-nowrap capitalize">
          <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${saleStatusDotClass(statusLabel)}`} />
          {statusLabel}
        </td>
        <td className="rounded-r-xl px-3 py-4 whitespace-nowrap">
          <CollapsibleTrigger
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#DFE2E0] bg-white px-3 py-1.5 text-sm whitespace-nowrap transition-all hover:bg-[#DCE4DF]"
            aria-label={'View ' + formatSaleId(sale.id) + ' details'}
          >
            View
            <ChevronDown className={'h-4 w-4 transition-transform ' + (isExpanded ? 'rotate-180' : '')} />
          </CollapsibleTrigger>
        </td>
      </tr>
      {isExpanded ? (
        <tr>
          <td colSpan={columnCount} className="p-0">
            <SaleDetails sale={sale} />
          </td>
        </tr>
      ) : null}
    </Collapsible>
  )
}

function SaleDetails({ sale }: { sale: Sale }) {
  const details = [
    ['Customer', getSaleCustomerName(sale)],
    ['Order type', normalizeOrderText(sale.orderType)],
    ['Status', getSaleStatusLabel(sale)],
    ['Driver', sale.driverName || 'Unassigned'],
    ['Pickup address', sale.pickUpAddress || '-'],
    ['Delivery address', sale.deliveryAddress || '-'],
    ['Sale date', formatDate(sale.created_At)],
    ['Quantity', getSaleQuantity(sale)],
    ['Total amount', formatPeso(sale.total)],
  ]

  return (
    <div className="border-t border-[#E2E2E2] bg-white p-4">
      <dl className="grid grid-cols-4 gap-4 text-sm">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-[#737A76]">{label}</dt>
            <dd className="wrap-break-word font-medium text-[#121514] capitalize">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 max-h-80 overflow-auto rounded-lg border border-[#E2E2E2] scrollbar-none">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Sale products</caption>
          <thead className="sticky top-0 bg-[#F0F1F1] text-xs text-[#737A76]">
            <tr>
              {['Product', 'Quantity', 'Unit price', 'Amount'].map((column) => (
                <th key={column} scope="col" className="px-3 py-2 font-normal">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sale.orders.map((item, index) => (
              <tr key={`${sale.id}-${index}`} className="border-t border-[#E2E2E2]">
                <td className="px-3 py-3 capitalize">{item.productName}</td>
                <td className="px-3 py-3">{item.quantity}</td>
                <td className="whitespace-nowrap px-3 py-3">{formatPeso(item.price)}</td>
                <td className="whitespace-nowrap px-3 py-3 font-medium">{formatPeso(item.totalAmount)}</td>
              </tr>
            ))}
            {sale.orders.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-3 text-[#737A76]">No products recorded.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
