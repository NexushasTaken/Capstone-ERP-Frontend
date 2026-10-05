import { TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function ErrorPage() {
  return (
    <div className="flex w-full h-screen items-center justify-center">
      <div className="flex flex-col gap-4 p-4 items-center justify-center w-full max-w-sm h-96 bg-background rounded-xl">
        <div className="flex items-center justify-center h-20 w-20 bg-destructive/10 rounded-full">
          <TriangleAlert className="w-12 h-12 text-destructive" />
        </div>
        <span className="text-4xl font-semibold text-center text-foreground">Something went wrong</span>
        <p className="text-center text-foreground">
          We encountered an unexpected error. Please try again or return home.
        </p>
        <Link href="/" className="text-center p-4 w-full bg-primary text-primary-foreground rounded-lg text-lg mt-4">
          Return to Login
        </Link>
      </div>
    </div>
  )
}
