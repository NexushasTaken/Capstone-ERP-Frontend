import { Suspense } from "react"
import type { Metadata } from "next"
import SalesView from "./_components/SalesView"

export const metadata: Metadata = { title: "Sales" }

export default function SalesPage() {
  return (
    <main className="h-screen w-full p-4">
      {/* The view reads its list state from the URL (useSearchParams), which needs a Suspense boundary. */}
      <Suspense>
        <SalesView />
      </Suspense>
    </main>
  )
}
