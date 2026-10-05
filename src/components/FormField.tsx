import type { ComponentProps, ReactNode } from 'react'
import { Input } from '@/components/ui/input'

// A label stacked above its input, as used in the add/edit modals.
export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-[#121514]">
      <span className="text-xs text-[#68716C]">{label}</span>
      {children}
    </label>
  )
}

export function FormInput({ className = '', ...props }: ComponentProps<typeof Input>) {
  return (
    <Input
      className={`h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514] ${className}`}
      {...props}
    />
  )
}
