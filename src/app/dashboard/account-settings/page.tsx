import type { Metadata } from "next"
import AccountSettingsView from "./_components/AccountSettingsView"

export const metadata: Metadata = { title: "Account settings" }

export default function AccountSettingsPage() {
  return <AccountSettingsView />
}
