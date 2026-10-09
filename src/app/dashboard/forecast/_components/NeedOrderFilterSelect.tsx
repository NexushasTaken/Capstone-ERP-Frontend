"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NeedOrderFilterSelectProps {
  needOrderOnly: boolean
  onChange: (needOrderOnly: boolean) => void
}

const items = [
  { value: "all", label: "All products" },
  { value: "need", label: "Need ordering" },
]

export default function NeedOrderFilterSelect({ needOrderOnly, onChange }: NeedOrderFilterSelectProps) {
  return (
    <div className="w-48">
      <Select items={items} onValueChange={(next) => onChange(next === "need")} value={needOrderOnly ? "need" : "all"}>
        <SelectTrigger aria-label="Filter products that need ordering" className="w-full">
          <SelectValue placeholder="All products" />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
