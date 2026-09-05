'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

const dayOptions = [7, 14, 21, 30]

export default function MovementVelocity() {
  const [selectedDays, setSelectedDays] = useState(7)

  return (
    <article className="rounded-2xl border border-[#DCE4DE] bg-white p-5 shadow-sm flex flex-col h-96 lg:h-full">
      <div className="flex w-full justify-between gap-4">
        <h2 className="font-semibold text-[#0c0d0d]">
          Movement Velocity
        </h2>

        <div className="flex gap-1">
          {dayOptions.map((days) => (
            <Button
              key={days}
              type="button"
              size="xs"
              variant={selectedDays === days ? 'default' : 'outline'}
              onClick={() => setSelectedDays(days)}
              className="rounded-lg"
            >
              {days}D
            </Button>
          ))}
        </div>
      </div>


      <div className="mt-5 space-y-5">
      </div>
    </article>
  )
}
