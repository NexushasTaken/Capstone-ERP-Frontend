import { ClockAlert } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function SessionExpiredPage() {
  return (
    <div className='flex w-full h-screen items-center justify-center'>
        <div className='flex flex-col gap-4 p-4 items-center justify-center w-full max-w-sm h-96 bg-white rounded-xl'>
            <div className='flex items-center justify-center h-20 w-20 bg-red-100 rounded-full'>
            <ClockAlert className='w-12 h-12 text-red-600' />
            </div>
            <span className='text-4xl font-semibold text-center text-[#0c0d0d]'>Session Expired</span>
            <p className='text-center text-[#0c0d0d]'>Your session has timed out for security reasons. Please log in again to continue.</p>
            <Link href="/" className='text-center p-4 w-full bg-[#0c0d0d] text-white rounded-lg text-lg mt-4'>
                Return to Login
            </Link>
        </div>
    </div>
  )
}
