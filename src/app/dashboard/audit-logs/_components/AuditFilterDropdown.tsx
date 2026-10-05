"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import type { AuditFilterOption } from "@/types/auditLog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AuditFilterDropdownProps<T extends string | number> {
  label: string
  allLabel: string
  options: AuditFilterOption<T>[]
  value: T | null
  onChange: (value: T | null) => void
  searchPlaceholder?: string
}

// Single-select: the backend filters by one value per field. `null` means "All".
export default function AuditFilterDropdown<T extends string | number>({
  label,
  allLabel,
  options,
  value,
  onChange,
  searchPlaceholder,
}: AuditFilterDropdownProps<T>) {
  const [search, setSearch] = useState("")
  const selected = options.find((option) => option.value === value)
  const normalizedSearch = search.trim().toLowerCase()
  const filteredOptions = normalizedSearch
    ? options.filter((option) => option.label.toLowerCase().includes(normalizedSearch))
    : options

  function renderItem(itemValue: T | null, itemLabel: string, description?: string) {
    const checked = itemValue === value

    return (
      <DropdownMenuItem
        key={itemValue ?? "all"}
        onClick={() => {
          // Picking the selected item again goes back to "All".
          onChange(checked ? null : itemValue)
          setSearch("")
        }}
        className="cursor-pointer items-start gap-2 px-2 py-2"
      >
        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border">
          {checked && <Check className="h-3 w-3" />}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate capitalize">{itemLabel}</span>
          {description && <span className="truncate text-xs text-muted-foreground">{description}</span>}
        </span>
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className={selected ? "border-foreground text-foreground" : undefined}
            type="button"
            variant="outline"
          />
        }
      >
        <span className="text-muted-foreground">{label}:</span>
        <span className="max-w-32 truncate capitalize">{selected?.label ?? "All"}</span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Filter by {label.toLowerCase()}</DropdownMenuLabel>
          {searchPlaceholder && (
            <div className="px-1.5 pb-2">
              <Input
                className="h-9 w-full rounded-lg"
                onChange={(event) => setSearch(event.target.value)}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
                placeholder={searchPlaceholder}
                value={search}
              />
            </div>
          )}

          <div className="max-h-72 overflow-y-auto">
            {!normalizedSearch && renderItem(null, allLabel)}
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-3 text-sm text-muted-foreground">No matches found.</div>
            ) : (
              filteredOptions.map((option) => renderItem(option.value, option.label, option.description))
            )}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
