'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useCooldown } from '@/hooks/useCooldown'

interface ExportCsvButtonProps {
  onExport: () => void
  disabled?: boolean
}

const COOLDOWN_SECONDS = 10

// "Export to CSV" button that locks itself for a few seconds after each export.
export default function ExportCsvButton({ onExport, disabled = false }: ExportCsvButtonProps) {
  const cooldown = useCooldown(COOLDOWN_SECONDS)

  return (
    <Button
      variant="outline"
      className="whitespace-nowrap"
      disabled={cooldown.isActive || disabled}
      type="button"
      onClick={() => {
        onExport()
        cooldown.start()
      }}
    >
      {cooldown.isActive ? (
        <>
          <Spinner data-icon="inline-start" />
          Cooldown
        </>
      ) : (
        'Export to CSV'
      )}
    </Button>
  )
}
