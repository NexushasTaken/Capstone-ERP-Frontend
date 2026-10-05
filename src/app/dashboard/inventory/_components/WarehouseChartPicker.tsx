'use client'

import { useState } from 'react'
import { Check, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { WarehouseListItem } from '@/types/warehouseCapacity'
import { MAX_SELECTED_WAREHOUSES } from '../_lib/warehouseCapacityHelpers'

interface WarehouseChartPickerProps {
  warehouses: WarehouseListItem[]
  selectedIds: number[]
  onToggle: (warehouseId: number) => void
}

// "Select charts" dropdown: choose up to MAX_SELECTED_WAREHOUSES warehouses to chart.
export default function WarehouseChartPicker({ warehouses, selectedIds, onToggle }: WarehouseChartPickerProps) {
  const [search, setSearch] = useState('')
  const searchValue = search.toLowerCase()
  const filteredWarehouses = warehouses.filter((warehouse) =>
    search === '' ||
    warehouse.name.toLowerCase().includes(searchValue) ||
    warehouse.address.toLowerCase().includes(searchValue)
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="rounded-xl cursor-pointer border-[#DFE2E0] px-3 py-2 text-sm"
            type="button"
            variant="outline"
          />
        }
      >
        <CheckSquare className="h-4 w-4" />
        Select charts
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {selectedIds.length} of {MAX_SELECTED_WAREHOUSES} charts selected
          </DropdownMenuLabel>
          <div className="px-1.5 pb-2">
            {/* Stop the menu from treating typing and clicks in the search box as menu navigation. */}
            <Input
              className="h-9 w-full rounded-lg border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
              onChange={(event) => setSearch(event.target.value)}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              placeholder="Search warehouses"
              value={search}
            />
          </div>

          <div className="max-h-72 overflow-y-auto">
            {filteredWarehouses.length === 0 ? (
              <div className="px-2 py-3 text-sm text-[#737A76]">
                No warehouses found.
              </div>
            ) : (
              filteredWarehouses.map((warehouse) => {
                const checked = selectedIds.includes(warehouse.id)
                const disabled = !checked && selectedIds.length >= MAX_SELECTED_WAREHOUSES

                return (
                  <DropdownMenuItem
                    key={warehouse.id}
                    closeOnClick={false}
                    disabled={disabled}
                    onClick={() => {
                      if (!disabled) onToggle(warehouse.id)
                    }}
                    className="cursor-pointer items-start gap-2 px-2 py-2"
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[#C9D1CB]">
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate capitalize">{warehouse.name}</span>
                      <span className="truncate text-xs text-[#737A76]">
                        {warehouse.address}
                      </span>
                    </span>
                  </DropdownMenuItem>
                )
              })
            )}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
