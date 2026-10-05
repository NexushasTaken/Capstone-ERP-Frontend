"use client"

import { useState, type ComponentProps, type ReactNode } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "cn"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"

interface PasswordInputProps extends Omit<ComponentProps<"input">, "type"> {
  /** Icon shown before the input. */
  leading?: ReactNode
  /** Classes for the surrounding group (the visible border), not the `<input>` itself. */
  groupClassName?: string
}

// Password input with an eye button that shows or hides what was typed.
// Everything else (register props, ref, aria-invalid) goes straight to the input.
export default function PasswordInput({ leading, groupClassName, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye

  return (
    <InputGroup className={cn("h-10 rounded-xl", groupClassName)}>
      {leading && <InputGroupAddon>{leading}</InputGroupAddon>}
      <InputGroupInput type={visible ? "text" : "password"} className={className} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={props.disabled}
          onClick={() => setVisible((v) => !v)}
        >
          <Icon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
