import type { StaffProfile } from '@/app/types/profile'

export function formatProfileDetails(profile: StaffProfile) {
  return `${profile.positionType} · ${profile.type}`
}
