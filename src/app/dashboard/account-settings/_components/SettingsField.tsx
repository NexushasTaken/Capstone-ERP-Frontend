import type { ComponentProps, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Label on the left, input on the right. `SettingsRow` lines other content up with the inputs.
const fieldLabelColumn = "grid-cols-[150px_1fr]"

interface SettingsFieldProps extends ComponentProps<typeof Input> {
  label: string
  /** Shown under the input. */
  error?: string
}

export function SettingsField({ label, error, ...inputProps }: SettingsFieldProps) {
  return (
    <label className={`grid ${fieldLabelColumn} items-center gap-3 text-sm text-foreground`}>
      <span className="text-muted-foreground">{label}</span>
      <Input aria-invalid={!!error} {...inputProps} />
      {error && <span className="col-start-2 text-xs text-destructive">{error}</span>}
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
