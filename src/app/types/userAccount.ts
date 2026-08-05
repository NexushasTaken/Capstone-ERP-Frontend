/** Maps to the UserType table. */
export interface UserType {
  id: number
  type: string
}

/** Maps to the UserPosition table. */
export interface UserPosition {
  id: number
  position: string
}

/**
 * Maps to the UserAccounts table.
 * Keep password and salt server-side; do not return them from authenticated-user APIs.
 */
export interface UserAccount {
  id: number
  userTypeId: number
  userPositionId: number
  email: string
  password: string
  salt: string
}

/** Maps to the UserInformation table. */
export interface UserInformation {
  userAccountId: number
  firstName: string
  lastName: string
}

/** Payload sent by the login form to a future authentication endpoint. */
export interface LoginCredentials {
  email: string
  password: string
}

/** Safe account shape returned after a successful login. */
export interface AuthenticatedUser {
  account: Omit<UserAccount, 'password' | 'salt'>
  information: UserInformation
  userType: UserType
  userPosition: UserPosition
}
