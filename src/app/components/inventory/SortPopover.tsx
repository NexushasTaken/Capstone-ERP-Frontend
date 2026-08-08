import React from 'react'
import { ArrowDownUp, Check } from 'lucide-react'

import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

import { rawMaterialSortOptions } from '@/app/utils/inventoryMockData'
import { SortPopoverProps } from '@/app/types/inventory'

export default function SortPopover({
  value,
  order,
  onChange,
  trigger,
}: SortPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        className="cursor-pointer rounded-xl border border-[#E1E4E2] p-2 text-[#121514] transition-colors hover:bg-[#F7F9F7]"
        >
        {trigger ?? <ArrowDownUp size={18} />}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72">
        <PopoverHeader className="border-b px-4 py-3">
          <PopoverTitle>Sort by</PopoverTitle>
        </PopoverHeader>

        <div className="flex flex-col">
          {rawMaterialSortOptions.map((option) => {
            const selected =
              value === option.value &&
              order === option.order

            return (
              <button
                key={`${option.value}-${option.order}`}
                type="button"
                onClick={() =>
                  onChange(option.value, option.order)
                }
                className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-[#F7F9F7] ${
                  selected
                    ? 'bg-[#F7F9F7] font-medium'
                    : ''
                }`}
              >
                <span>{option.label}</span>

                {selected && (
                  <Check
                    size={16}
                    className="text-[#121514]"
                  />
                )}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}