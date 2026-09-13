'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PaginationDemo } from '@/app/components/Pagination'
import { fetchInventoryVelocity } from '@/app/services/inventoryApi'
import { queryKeys } from '@/app/utils/query/queryKeys'
import Loading from '@/app/components/loaders/Loading'

const dayOptions = [7, 14, 21, 30]

export default function MovementVelocity() {
  const [selectedDays, setSelectedDays] = useState(7)
  const [currentPage, setCurrentPage] = useState(1)
  const params = { cutOffDate: selectedDays, page: currentPage, pageSize: 10 }
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.inventories.velocity(params),
    queryFn: () => fetchInventoryVelocity(params),
  })

  return (
    <article className="rounded-2xl border border-[#DCE4DE] bg-white p-5 shadow-sm flex flex-col h-96">
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
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-[#68716C]">
              <tr>
                <th scope="col" className="pb-3 pr-3">Inventory</th>
                <th scope="col" className="pb-3 pr-3">Warehouse</th>
                <th scope="col" className="pb-3 pr-3">Classification</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.inventoryId} className="border-t border-[#E7ECE8]">
                  <td className="py-3 pr-3 capitalize">{item.name}</td>
                  <td className="py-3 pr-3">{item.warehouse}</td>
                  <td className="py-3 pr-3">{item.classification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {!isLoading && !isError && data && (
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
