import type { ReactNode } from "react"
import { ArrowDownUp, Check } from "lucide-react"

import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"

export interface SortOption<TSortBy extends string | number> {
  label: string
  value: TSortBy
  order: "asc" | "desc"
}

interface SortPopoverProps<TSortBy extends string | number> {
  value: TSortBy
  order: "asc" | "desc"
  options: SortOption<TSortBy>[]
  onChange: (value: TSortBy, order: "asc" | "desc") => void
  trigger?: ReactNode
}

export default function SortPopover<TSortBy extends string | number>({
  value,
  order,
  options,
  onChange,
  trigger,
}: SortPopoverProps<TSortBy>) {
  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer rounded-xl border border-border p-2 text-foreground transition-colors hover:bg-accent">
        {trigger ?? <ArrowDownUp size={18} />}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72">
        <PopoverHeader className="border-b px-4 py-3">
          <PopoverTitle>Sort by</PopoverTitle>
        </PopoverHeader>

        <div className="flex flex-col">
          {options.map((option) => {
            const selected = value === option.value && order === option.order

            return (
              <button
                key={`${option.value}-${option.order}`}
                type="button"
                onClick={() => onChange(option.value, option.order)}
                className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-accent ${
                  selected ? "bg-muted/50 font-medium" : ""
                }`}
              >
                <span>{option.label}</span>

                {selected && <Check size={16} className="text-foreground" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
