import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Label on the left, input on the right. `SettingsRow` lines other content up with the inputs.
const fieldLabelColumn = 'grid-cols-[150px_1fr]'

interface SettingsFieldProps extends Omit<ComponentProps<typeof Input>, 'onChange'> {
  label: string
  onChange: (value: string) => void
}

export function SettingsField({ label, onChange, ...inputProps }: SettingsFieldProps) {
  return (
    <label className={`grid ${fieldLabelColumn} items-center gap-3 text-sm text-[#121514]`}>
      <span className="text-[#68716C]">{label}</span>
      <Input
        className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
        onChange={(event) => onChange(event.target.value)}
        {...inputProps}
      />
    </label>
  )
}

export function SettingsRow({ children }: { children: ReactNode }) {
  return (
    <div className={`grid ${fieldLabelColumn} gap-3`}>
      <span />
      {children}
    </div>
  )
}

export function SettingsHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-medium text-[#121514]">{title}</h2>
      <p className="text-sm text-[#737A76]">{description}</p>
    </div>
  )
}

export function SaveButton({ disabled }: { disabled: boolean }) {
  return (
    <SettingsRow>
      <div className="flex justify-end">
        <Button className="rounded-xl px-3 py-2 text-sm" disabled={disabled} type="submit">
          Save changes
        </Button>
      </div>
    </SettingsRow>
  )
}
