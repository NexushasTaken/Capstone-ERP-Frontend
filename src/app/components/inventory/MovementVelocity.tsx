import type { MovementVelocityItem } from '@/app/types/inventory'
import { getVelocityColor } from '@/app/utils/inventoryHelpers'

interface MovementVelocityProps {
  items: MovementVelocityItem[]
}

export default function MovementVelocity({ items }: MovementVelocityProps) {
  return (
    <article className="rounded-2xl border border-[#DCE4DE] bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-[#0c0d0d]">Movement Velocity <span className="text-sm font-normal text-[#68716C]">(Top 50)</span></h2>
      <div className="mt-5 space-y-5">
        {items.map((item) => (
          <div key={item.category}>
            <div className="mb-2 flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-[#4E5752]">{item.label}</span>
              <span className="font-semibold text-[#0c0d0d]">{item.percentage}%</span>
            </div>
            <div aria-label={`${item.label}: ${item.percentage}%`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={item.percentage} className="h-3 overflow-hidden rounded-full bg-[#E6EAE7]" role="progressbar">
              <div className={`h-full rounded-full ${getVelocityColor(item.category)}`} style={{ width: `${item.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}
