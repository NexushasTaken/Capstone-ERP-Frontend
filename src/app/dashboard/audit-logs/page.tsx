import type { Metadata } from "next"
import AuditLogsView from "./_components/AuditLogsView"

export const metadata: Metadata = { title: "Audit logs" }

export default function AuditLogsPage() {
  return <AuditLogsView />
}
