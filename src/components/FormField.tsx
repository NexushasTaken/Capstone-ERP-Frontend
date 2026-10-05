import type { ComponentProps, ReactNode } from 'react'
import { Input } from '@/components/ui/input'

// A label stacked above its input, as used in the add/edit modals. `error` shows under the input.
export function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-foreground">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  )
}

export function FormInput({ className = '', ...props }: ComponentProps<typeof Input>) {
  return (
    <Input
      className={`h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 ${className}`}
      {...props}
    />
  )
}
