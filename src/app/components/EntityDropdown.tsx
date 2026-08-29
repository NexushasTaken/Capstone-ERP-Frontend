'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Plus, RefreshCw, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EntityDropdownProps } from '@/app/types/entityDropdown'
import Loading from '@/app/components/loaders/Loading'

const SEARCH_DEBOUNCE_MS = 400

export default function EntityDropdown({
  options,
  value,
  placeholder,
  emptyLabel,
  addHref,
  addLabel,
  onSelect,
  isLoading,
  onSearch,
  isSearching,
  searchPlaceholder = 'Search...',
}: EntityDropdownProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const skipNextRef = useRef(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onSearchRef = useRef(onSearch)
  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => {
    if (!onSearchRef.current || !open) return

    if (skipNextRef.current) {
      skipNextRef.current = false
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearchRef.current?.(searchQuery.trim(), true)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery, open])

  function handleManualRefresh() {
    if (!onSearch) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    onSearch(searchQuery.trim(), true)
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          if (debounceRef.current) clearTimeout(debounceRef.current)
          setSearchQuery('')
        }
      }}
    >
      <DropdownMenuTrigger
        type="button"
        className="flex h-10 w-full items-center justify-between rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
      >
        <span className={value ? 'text-[#121514] capitalize' : 'text-[#737A76]'}>
          {isLoading ? 'Loading...' : value || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#737A76]" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="flex max-h-72 w-(--anchor-width) flex-col overflow-hidden p-0">
        {onSearch && (
          <div className="flex items-center gap-2 border-b border-[#E7ECE8] px-2.5 py-2">
            <Search className="h-4 w-4 shrink-0 text-[#737A76]" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              placeholder={searchPlaceholder}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#737A76]"
            />
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isSearching}
              aria-label="Refresh"
              title="Refresh"
              className="shrink-0 rounded-md p-1 text-[#737A76] transition-colors hover:bg-[#EFF2F0] hover:text-[#121514] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-y-auto p-1">
          {isLoading || isSearching ? (
            <div className="flex h-full items-center justify-center p-3 text-center text-xs text-[#737A76]">
              <Loading />
            </div>
          ) : options.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 p-3 text-center">
              <span className="text-xs text-[#737A76]">{emptyLabel}</span>
              <button
                type="button"
                onClick={() => router.push(addHref)}
                className="flex items-center gap-1 rounded-lg border border-[#DFE2E0] px-2.5 py-1.5 text-xs font-medium text-[#121514] hover:bg-[#DCE4DF]"
              >
                <Plus className="h-3.5 w-3.5" />
                {addLabel}
              </button>
            </div>
          ) : (
            options.map((option) => (
              <DropdownMenuItem key={option.id} onClick={() => onSelect(option.id)}>
                <div className="flex flex-col">
                  <span className="capitalize">{option.label}</span>
                  {option.sublabel && (
                    <span className="text-xs text-[#737A76]">{option.sublabel}</span>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}