import type { Metadata } from "next"
import AccountsView from "./_components/AccountsView"

export const metadata: Metadata = { title: "Accounts" }

export default function AccountsPage() {
  return <AccountsView />
}
