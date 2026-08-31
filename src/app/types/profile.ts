export interface StaffProfile {
  firstName: string
  type: string
  position: string
  avatarSrc: string
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
  position: string
  type: string
  token: string | null
}
