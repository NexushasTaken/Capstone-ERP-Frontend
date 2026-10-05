import { ClockAlert } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function SessionExpiredPage() {
  return (
    <div className='flex w-full h-screen items-center justify-center'>
        <div className='flex flex-col gap-4 p-4 items-center justify-center w-full max-w-sm h-96 bg-background rounded-xl'>
            <div className='flex items-center justify-center h-20 w-20 bg-destructive/10 rounded-full'>
            <ClockAlert className='w-12 h-12 text-destructive' />
            </div>
            <span className='text-4xl font-semibold text-center text-foreground'>Session Expired</span>
            <p className='text-center text-foreground'>Your session has timed out for security reasons. Please log in again to continue.</p>
            <Link href="/" className='text-center p-4 w-full bg-primary text-primary-foreground rounded-lg text-lg mt-4'>
                Return to Login
            </Link>
        </div>
    </div>
  )
}
