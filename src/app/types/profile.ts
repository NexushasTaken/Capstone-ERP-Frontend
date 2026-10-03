export type Role = 'owner' | 'secretary'

export interface StaffProfile {
  firstName: string
  lastName: string
  role: string
}

export interface ProfileModalProps {
  isOpen: boolean
  profile: StaffProfile
  onClose: () => void
}

export interface CurrentUser {
  id: number
  firstName: string
  lastName: string
  role: string
}
