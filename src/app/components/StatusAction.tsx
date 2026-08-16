import { Ellipsis } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { StatusActionProps } from '@/app/types/statusAction'

export default function StatusAction({
  actions,
  label,
  onAction,
}: StatusActionProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            aria-label={label}
            className="cursor-pointer rounded-xl border border-[#DFE2E0] p-1.5 transition-colors hover:bg-[#DCE4DF]"
            type="button"
          />
        }
      >
        <Ellipsis size={18} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuGroup>
          {actions.map((action) => {
            const Icon = action.icon

            return (
              <DropdownMenuItem
                key={action.value}
                variant={action.variant}
                onClick={() => onAction(action.value)}
                className="cursor-pointer gap-2 px-2 py-2"
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
