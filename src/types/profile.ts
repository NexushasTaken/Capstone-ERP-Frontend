export type Role = "owner" | "secretary"

export interface StaffProfile {
  firstName: string
  lastName: string
  role: string
}

export interface CurrentUser {
  id: number
  firstName: string
  lastName: string
  role: string
}
