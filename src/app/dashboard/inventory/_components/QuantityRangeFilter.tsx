"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

interface QuantityRangeFilterProps {
  min: string
  max: string
  onChange: (range: { min: string; max: string }) => void
}

// Min / max quantity. Edits are kept locally and applied on blur or Enter so typing doesn't refetch per key.
export default function QuantityRangeFilter({ min, max, onChange }: QuantityRangeFilterProps) {
  const [draft, setDraft] = useState({ min, max })
  // Follow the URL when it changes elsewhere (e.g. Clear filters).
  const [synced, setSynced] = useState({ min, max })
  if (synced.min !== min || synced.max !== max) {
    setSynced({ min, max })
    setDraft({ min, max })
  }

  function commit() {
    if (draft.min !== min || draft.max !== max) onChange(draft)
  }

  function field(key: "min" | "max", label: string) {
    return (
      <Input
        aria-label={label}
        className="w-24"
        inputMode="numeric"
        onBlur={commit}
        onChange={(event) => setDraft({ ...draft, [key]: event.target.value.replace(/\D/g, "") })}
        onKeyDown={(event) => event.key === "Enter" && commit()}
        placeholder={label}
        value={draft[key]}
      />
    )
  }

  return (
    <div className="flex items-center gap-2">
      {field("min", "Min qty")}
      <span className="text-muted-foreground">–</span>
      {field("max", "Max qty")}
    </div>
  )
}
