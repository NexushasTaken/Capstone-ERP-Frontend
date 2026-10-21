"use client"

import type { ReactNode } from "react"
import { ModalHeader } from "@/components/AppModal"
import SeeMoreModal from "@/components/SeeMoreModal"
import { formatDate, formatPeso, formatQuantity } from "@/lib/format"
import type { Purchase } from "@/types/purchase"
import { formatDay, formatPurchaseId, formatSupplier } from "../_lib/purchaseHelpers"
import PurchaseStatusLabel from "./PurchaseStatusLabel"

interface PurchaseDetailsModalProps {
  purchase: Purchase | null
  onClose: () => void
}

// The read-only "See more" view of a purchase: dates, lead time, and ordered vs received per line.
export default function PurchaseDetailsModal({ purchase, onClose }: PurchaseDetailsModalProps) {
  const isReceived = purchase?.status === "received"

  return (
    <SeeMoreModal
      open={purchase !== null}
      onClose={onClose}
      className="flex h-auto flex-col lg:max-h-[80vh] lg:max-w-3xl"
    >
      <ModalHeader
        title={purchase ? formatPurchaseId(purchase.id) : ""}
        detail={purchase ? <span className="capitalize">{formatSupplier(purchase.supplierName)}</span> : undefined}
        extra={purchase && <PurchaseStatusLabel className="text-sm" status={purchase.status} />}
        onClose={onClose}
      />
      {purchase && (
        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Detail label="Ordered on">{formatDay(purchase.orderedOn)}</Detail>
            <Detail label="Received on">{purchase.receivedAt ? formatDate(purchase.receivedAt) : "—"}</Detail>
            <Detail label="Lead time">
              {purchase.leadTimeDays === null
                ? "—"
                : `${purchase.leadTimeDays} day${purchase.leadTimeDays === 1 ? "" : "s"}`}
            </Detail>
            <Detail label={isReceived ? "Cost received" : "Total cost"}>
              {formatPeso(isReceived ? (purchase.receivedTotal ?? 0) : purchase.total)}
            </Detail>
          </div>
          {purchase.note && (
            <p className="whitespace-pre-wrap wrap-anywhere rounded-lg bg-muted p-3 text-sm text-foreground">
              {purchase.note}
            </p>
          )}
          <div className="overflow-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">Ordered</th>
                  {isReceived && <th className="px-3 py-2 font-medium">Received</th>}
                  <th className="px-3 py-2 font-medium">Unit cost</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {purchase.lines.map((line) => (
                  <tr key={line.productId} className="border-t border-border">
                    <td className="px-3 py-3 capitalize">{line.productName}</td>
                    <td className="whitespace-nowrap px-3 py-3">{formatQuantity(line.quantity, line.unit)}</td>
                    {isReceived && (
                      <td
                        className={
                          (line.receivedQuantity ?? 0) < line.quantity
                            ? "whitespace-nowrap px-3 py-3 text-amber-700"
                            : "whitespace-nowrap px-3 py-3"
                        }
                      >
                        {formatQuantity(line.receivedQuantity ?? 0, line.unit)}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-3 py-3">{formatPeso(line.unitCost)}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-medium">{formatPeso(line.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Recorded {formatDate(purchase.created_At)}</p>
        </div>
      )}
    </SeeMoreModal>
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col rounded-lg bg-muted px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{children}</span>
    </div>
  )
}
