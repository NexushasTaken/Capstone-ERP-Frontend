import { Suspense } from "react"
import type { Metadata } from "next"
import AuditLogsView from "./_components/AuditLogsView"

export const metadata: Metadata = { title: "Audit logs" }

export default function AuditLogsPage() {
  // The view reads its list state from the URL (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense>
      <AuditLogsView />
    </Suspense>
  )
}
