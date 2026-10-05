import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

// Search box with a clear (X) button once something has been typed.
export default function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <div className="relative">
      <Input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer transition-colors hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      ) : (
        <Search className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      )}
    </div>
  )
}
