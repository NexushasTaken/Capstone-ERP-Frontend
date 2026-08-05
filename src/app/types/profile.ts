export type ProfileRole = 'Admin' | 'Staff' | 'Manager'

export type PositionType = 'CEO' | 'Operations Manager' | 'Sales Associate' | 'Warehouse Staff'

export interface StaffProfile {
  firstName: string
  type: ProfileRole
  positionType: PositionType
  avatarSrc: string
}
