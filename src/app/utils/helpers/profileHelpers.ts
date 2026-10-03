import type { StaffProfile } from '@/app/types/profile'

export function formatProfileName(profile: Pick<StaffProfile, 'firstName' | 'lastName'>) {
  return `${profile.lastName}, ${profile.firstName}`
}

export function formatProfileDetails(profile: Pick<StaffProfile, 'role'>) {
  return profile.role
}
