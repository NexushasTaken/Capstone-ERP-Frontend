interface EntityDropdownOption {
  id: number
  label: string
  sublabel?: string
}

export interface EntityDropdownProps {
  options: EntityDropdownOption[]
  value: string
  placeholder: string
  emptyLabel: string
  addHref?: string
  addLabel?: string
  onSelect: (id: number) => void
  isLoading?: boolean
  onSearch?: (query: string) => void
  isSearching?: boolean
  searchPlaceholder?: string
}
