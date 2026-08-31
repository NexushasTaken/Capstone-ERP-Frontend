import type { StaffProfile } from '@/app/types/profile'

export function formatProfileDetails(profile: Pick<StaffProfile, 'position' | 'type'>) {
  return `${profile.position} - ${profile.type}`
}
