import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AccountListItem } from '@/types/account'
import { roleOptions } from '../_lib/accountHelpers'

interface RoleSelectProps {
  value: AccountListItem['role']
  onChange: (role: AccountListItem['role']) => void
  disabled?: boolean
}

export default function RoleSelect({ value, onChange, disabled }: RoleSelectProps) {
  return (
    <Select
      disabled={disabled}
      items={roleOptions}
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next)
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roleOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
