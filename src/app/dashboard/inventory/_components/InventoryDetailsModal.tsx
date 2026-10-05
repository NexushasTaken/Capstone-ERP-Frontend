'use client'

import type { ReactNode } from 'react'
import { Truck, Warehouse as WarehouseIcon } from 'lucide-react'
import CloseButton from '@/components/CloseButton'
import { ModalTitle } from '@/components/AppModal'
import SeeMoreModal from '@/components/SeeMoreModal'
import { formatDate } from '@/lib/format'
import {
  capitalize,
  formatInventoryId,
  formatNumber,
  getInventoryStatusStyleFromLabel,
} from '@/lib/helpers/inventoryHelpers'
import type { InventoryListItem } from '@/types/inventory'
import { useInventoryHistory } from '../_hooks/useInventory'

interface InventoryDetailsModalProps {
  item: InventoryListItem | null
  onClose: () => void
}

// The read-only "See more" view: stock level, recent movements and damage reports.
export default function InventoryDetailsModal({ item, onClose }: InventoryDetailsModalProps) {
  const { movements, damageRecords, shouldLoad } = useInventoryHistory(item?.id ?? null, item !== null)
  const statusStyle = item ? getInventoryStatusStyleFromLabel(item.status) : null

  return (
    <SeeMoreModal open={item !== null} onClose={onClose} className="flex flex-col h-auto lg:max-h-[70vh]">
      <div className="flex gap-2 w-full border-b border-[#E2E2E2] p-4 justify-between items-center">
        <div className="flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs">{item ? formatInventoryId(String(item.id)) : ''}</span>
            {statusStyle && (
              <span className={`text-sm font-medium inline-flex items-center gap-1 ${statusStyle.labelClassName}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dotClassName}`} />
                {item ? capitalize(item.status) : ''}
              </span>
            )}
          </div>
          <ModalTitle className="text-xl font-medium text-[#0c0d0d] capitalize">{item?.name}</ModalTitle>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <div className="flex flex-col w-full h-full overflow-y-auto">
        <div className="flex flex-col w-full h-fit p-4 gap-4">
          <div className="grid grid-cols-2 w-full gap-4">
            <InfoTile icon={<WarehouseIcon className="text-[#777777] w-6 h-6" />} label="Warehouse">
              <span className="capitalize">{item?.warehouseName}</span>
            </InfoTile>
            <InfoTile icon={<Truck className="text-[#777777] w-6 h-6" />} label="Date arrived">
              {item ? formatDate(item.dateArrived) : ''}
            </InfoTile>
          </div>
        </div>

        <div className="flex flex-col w-full h-full p-4">
          <SectionHeading>Inventory status</SectionHeading>

          <div className="flex flex-col w-full bg-[#F0F1F1] mt-4 rounded-xl p-4">
            <div className="flex w-full justify-between items-center">
              <div className="flex flex-col">
                <span className="text-5xl font-semibold text-[#0c0d0d]">{item?.quantity}</span>
                <span className="text-base font-light capitalize">{item?.name} available</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[#0c0d0d] text-2xl font-medium">{item?.reorderPoint}</span>
                <span className="font-light text-[#0c0d0d]">Reorder point</span>
              </div>
            </div>
          </div>

          <SectionHeading className="mt-8">Recent movements</SectionHeading>
          <div className="mt-4 flex w-full flex-col gap-2 max-h-72 overflow-auto scrollbar-none">
            {movements.isLoading && shouldLoad ? (
              <HistoryMessage>Loading movements...</HistoryMessage>
            ) : movements.isError ? (
              <HistoryError onRetry={() => movements.refetch()}>Unable to load movements.</HistoryError>
            ) : (movements.data ?? []).length === 0 ? (
              <HistoryMessage>No movements found.</HistoryMessage>
            ) : (
              (movements.data ?? []).map((record, index) => (
                <div key={record.created_At + '-' + index} className="flex items-center justify-between gap-4 p-2">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-sm font-medium text-[#121514] capitalize">{record.label}</span>
                    <span className="text-xs text-[#737A76]">{formatDate(record.created_At)}</span>
                  </div>
                  <span className={record.quantity < 0 ? 'shrink-0 text-sm font-semibold text-[#B42318]' : 'shrink-0 text-sm font-semibold text-[#187B49]'}>
                    {record.quantity > 0 ? '+' : ''}{formatNumber(record.quantity)} units
                  </span>
                </div>
              ))
            )}
          </div>

          <SectionHeading className="mt-8">Damaged inventory</SectionHeading>
          <div className="mt-4 flex w-full flex-col gap-2 max-h-72 overflow-auto scrollbar-none">
            {damageRecords.isLoading && shouldLoad ? (
              <HistoryMessage>Loading damage reports...</HistoryMessage>
            ) : damageRecords.isError ? (
              <HistoryError onRetry={() => damageRecords.refetch()}>Unable to load damage reports.</HistoryError>
            ) : (damageRecords.data ?? []).length === 0 ? (
              <HistoryMessage>No damage reports.</HistoryMessage>
            ) : (
              (damageRecords.data ?? []).map((record, index) => (
                <div key={record.created_At + '-' + index} className="flex flex-col gap-2 p-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-[#B42318]">{formatNumber(record.quantity)} units damaged</span>
                    <span className="text-xs text-[#737A76]">{formatDate(record.created_At)}</span>
                  </div>
                  <p className="whitespace-pre-wrap wrap-anywhere text-sm text-[#121514]">{record.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SeeMoreModal>
  )
}

function InfoTile({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center px-3 w-full gap-2 h-16 rounded-lg bg-[#F0F1F1]">
      <span className="flex shrink-0 items-center justify-center w-10 h-10 rounded-xl bg-[#1B1C1C]">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs">{label}</span>
        <span className="text-base font-semibold">{children}</span>
      </div>
    </div>
  )
}

function SectionHeading({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <span className="text-xs uppercase text-[#121514]">{children}</span>
      <div className="border-b border-[#E2E2E2] flex w-full h-px" />
    </div>
  )
}

function HistoryMessage({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="flex min-h-24 w-full items-center justify-center rounded-xl bg-[#F0F1F1] text-sm text-[#737A76]">
      {children}
    </div>
  )
}

function HistoryError({ children, onRetry }: { children: ReactNode; onRetry: () => void }) {
  return (
    <div role="alert" className="flex min-h-24 items-center justify-center gap-2 rounded-xl bg-[#F0F1F1] p-4 text-sm text-[#B42318]">
      {children}
      <button type="button" className="cursor-pointer underline" onClick={onRetry}>Retry</button>
    </div>
  )
}
