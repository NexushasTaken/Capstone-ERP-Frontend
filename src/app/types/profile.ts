export type ProfileRole = 'Admin' | 'Staff' | 'Manager'

export type PositionType = 'CEO' | 'Operations Manager' | 'Sales Associate' | 'Warehouse Staff'

interface StaffProfile {
  firstName: string
  type: ProfileRole
  positionType: PositionType
  avatarSrc: string
}

export interface ProfileModalProps {
  isOpen: boolean
  profile: StaffProfile
  onClose: () => void
}
