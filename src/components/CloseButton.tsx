import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CloseButtonProps {
  onClick: () => void
}

export default function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <Button aria-label="Close" onClick={onClick} size="icon-sm" type="button" variant="ghost">
      <X className="size-5 text-muted-foreground" />
    </Button>
  )
}
