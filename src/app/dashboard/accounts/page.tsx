import { Suspense } from "react"
import type { Metadata } from "next"
import AccountsView from "./_components/AccountsView"

export const metadata: Metadata = { title: "Accounts" }

export default function AccountsPage() {
  // The view reads its list state from the URL (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense>
      <AccountsView />
    </Suspense>
  )
}
