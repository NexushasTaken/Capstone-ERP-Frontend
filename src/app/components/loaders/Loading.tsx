import React from 'react'

export default function Loading() {
  return (
    <div className="flex-col gap-4 w-full flex items-center justify-center h-screen">
      <div className="w-20 h-20 border-4 border-transparent text-[#0c0d0d] text-4xl animate-spin flex items-center justify-center border-t-[#0c0d0d] rounded-full">
        <div className="w-16 h-16 border-4 border-transparent text-[#0c0d0d] text-2xl animate-spin flex items-center justify-center border-t-[#0c0d0d] rounded-full" />
      </div>
    </div>
  )
}
