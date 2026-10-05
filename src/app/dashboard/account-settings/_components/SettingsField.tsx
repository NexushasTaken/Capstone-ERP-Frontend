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
    <label className={`grid ${fieldLabelColumn} items-center gap-3 text-sm text-foreground`}>
      <span className="text-muted-foreground">{label}</span>
      <Input onChange={(event) => onChange(event.target.value)} {...inputProps} />
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
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function SaveButton({ disabled }: { disabled: boolean }) {
  return (
    <SettingsRow>
      <div className="flex justify-end">
        <Button disabled={disabled} type="submit">
          Save changes
        </Button>
      </div>
    </SettingsRow>
  )
}
