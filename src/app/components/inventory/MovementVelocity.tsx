'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PaginationDemo } from '@/app/components/Pagination'
import { fetchInventoryVelocity } from '@/app/services/inventoryApi'
import { queryKeys } from '@/app/utils/query/queryKeys'
import Loading from '@/app/components/loaders/Loading'
import { ArrowRightLeft } from 'lucide-react'
import { Progress, ProgressLabel } from '@/components/ui/progress'

const dayOptions = [7, 14, 21, 30]
const classificationColors: Record<string, string> = {
  fast: '[&_[data-slot=progress-indicator]]:bg-[#187B49]',
  stable: '[&_[data-slot=progress-indicator]]:bg-[#1769C2]',
  slow: '[&_[data-slot=progress-indicator]]:bg-[#D92D20]',
}

export default function MovementVelocity() {
  const [selectedDays, setSelectedDays] = useState(7)
  const [currentPage, setCurrentPage] = useState(1)
  const [view, setView] = useState<'table' | 'progress'>('table')
  const params = { cutOffDate: selectedDays, page: currentPage, pageSize: 10 }
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.inventories.velocity(params),
    queryFn: () => fetchInventoryVelocity(params),
  })
  const velocityGroups = new Map<string, number>()
  for (const item of data?.items ?? []) {
    const classification = item.classification.trim().toLowerCase()
    velocityGroups.set(classification, (velocityGroups.get(classification) ?? 0) + item.velocityMetric)
  }
  const totalVelocity = [...velocityGroups.values()].reduce((total, metric) => total + metric, 0)

  return (
    <article className="rounded-2xl border border-[#DCE4DE] bg-white p-5 shadow-sm flex flex-col h-96">
      <div className="flex w-full justify-between gap-4">
        <h2 className="font-semibold text-[#0c0d0d]">
          Movement Velocity
        </h2>

        <div className="flex gap-1">
          <Button
              type="button"
              size="xs"
              variant='outline'
              onClick={() => setView((current) => current === 'table' ? 'progress' : 'table')}
              aria-label={`Switch to ${view === 'table' ? 'progress' : 'table'} view`}
              aria-pressed={view === 'progress'}
              className="inline-flex gap-1 items-center rounded-lg"
            >
              <ArrowRightLeft className='text-black w-5 h-5'/>
              Switch View
          </Button>
          {dayOptions.map((days) => (
            <Button
              key={days}
              type="button"
              size="xs"
              variant={selectedDays === days ? 'default' : 'outline'}
              onClick={() => {
                setSelectedDays(days)
                setCurrentPage(1)
              }}
              aria-pressed={selectedDays === days}
              className="rounded-lg"
            >
              {days}D
            </Button>
          ))}
        </div>
      </div>


      <div className="mt-5 min-h-0 flex-1 overflow-auto" aria-busy={isLoading}>
        {isLoading ? (
          <div className='flex w-full h-96'>
            <Loading />
          </div>
        ) : isError ? (
          <div role="alert" className="space-y-2 text-sm text-red-600">
            <p>Unable to load movement velocity.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>Retry</Button>
          </div>
        ) : !data?.items.length ? (
          <p className="text-sm text-[#68716C]">No inventory movement found for this period.</p>
        ) : view === 'progress' ? (
          <div className="space-y-5">
            {[...velocityGroups].map(([classification, metric]) => {
              const percentage = totalVelocity > 0 ? (metric / totalVelocity) * 100 : 0
              return (
                <Progress
                  key={classification}
                  value={percentage}
                  className={`**:data-[slot=progress-track]:h-2 ${classificationColors[classification] ?? '**:data-[slot=progress-indicator]:bg-gray-500'}`}
                >
                  <ProgressLabel className="capitalize">{classification}</ProgressLabel>
                  <span className="ml-auto text-sm text-[#68716C] tabular-nums">
                    {metric.toLocaleString()} ({percentage.toFixed(1)}%)
                  </span>
                </Progress>
              )
            })}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-[#68716C]">
              <tr>
                <th scope="col" className="pb-3 pr-3">Inventory</th>
                <th scope="col" className="pb-3 pr-3">Classification</th>
                <th scope="col" className="pb-3 text-right">Velocity</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id} className="border-t border-[#E7ECE8]">
                  <td className="py-3 pr-3 capitalize">{item.name}</td>
                  <td className="py-3 pr-3">{item.classification}</td>
                  <td className="py-3 text-right tabular-nums">{item.velocityMetric.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {view === 'progress' || !isLoading && !isError && data && (
        <div className="flex w-full mt-4 overflow-x-auto justify-between items-center">
          <p className="text-xs text-[#68716C] flex">Showing {data.items.length.toLocaleString()} out of {data.rows.toLocaleString()} inventories</p>
          <div className='flex'>
            {data.pageCount > 1 && (
              <PaginationDemo currentPage={currentPage} totalPages={data.pageCount} onPageChange={setCurrentPage} />
            )}
          </div>
        </div>
      )}
    </article>
  )
}
