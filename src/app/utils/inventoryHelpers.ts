import type { InventoryHealthStatus, MovementVelocityCategory, WarehouseCapacity } from '@/app/types/inventory'

const riskStyles: Record<InventoryHealthStatus, { label: string; className: string }> = {
  healthy: { label: 'Healthy', className: 'bg-[#E6F3E8] text-[#31723B]' },
  attention: { label: 'Attention', className: 'bg-[#FFF3D6] text-[#9A6700]' },
  critical: { label: 'Critical', className: 'bg-[#FBE7E7] text-[#B42318]' },
}

export function getRiskStyle(status: InventoryHealthStatus) {
  return riskStyles[status]
}

export function getCapacityPercentage({ used, total }: WarehouseCapacity) {
  return Math.round((used / total) * 100)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

const velocityColors: Record<MovementVelocityCategory, string> = {
  fast: 'bg-[#187B49]',
  stable: 'bg-[#1769C2]',
  slow: 'bg-[#D92D20]',
}

export function getVelocityColor(category: MovementVelocityCategory) {
  return velocityColors[category]
}
