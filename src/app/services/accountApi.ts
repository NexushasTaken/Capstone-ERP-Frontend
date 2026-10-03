import type { AccountListItem, CreateAccountPayload, CredentialsInfo, ProfileInfo, UpdateCredentialsPayload } from '@/app/types/account'

// Dummy, in-memory data for frontend prototyping only. No backend calls yet —
// resets whenever this module is reloaded (e.g. full page refresh).
let accounts: AccountListItem[] = [
  { id: 1, role: 'owner', firstName: 'Alexandra', lastName: 'Reyes', email: 'alexandra.reyes@cpro.com' },
  { id: 2, role: 'secretary', firstName: 'Miguel', lastName: 'Santos', email: 'miguel.santos@cpro.com' },
  { id: 3, role: 'secretary', firstName: 'Bea', lastName: 'Cruz', email: 'bea.cruz@cpro.com' },
  { id: 4, role: 'secretary', firstName: 'Noel', lastName: 'Garcia', email: 'noel.garcia@cpro.com' },
  { id: 5, role: 'owner', firstName: 'Carmela', lastName: 'Villanueva', email: 'carmela.villanueva@cpro.com' },
  { id: 6, role: 'secretary', firstName: 'Dennis', lastName: 'Ocampo', email: 'dennis.ocampo@cpro.com' },
]

let nextId = accounts.length + 1

const SIMULATED_DELAY_MS = 300

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS))
}

// Keeps the session's own account visible in the list without hardcoding it into the seed data.
export function ensureAccountPresent(account: Pick<AccountListItem, 'id' | 'firstName' | 'lastName' | 'role'> & { email?: string }) {
  const existing = accounts.find((item) => item.id === account.id)

  if (existing) {
    existing.firstName = account.firstName
    existing.lastName = account.lastName
    return
  }

  accounts = [
    { id: account.id, role: (account.role as AccountListItem['role']) ?? 'secretary', firstName: account.firstName, lastName: account.lastName, email: account.email ?? '' },
    ...accounts,
  ]
  nextId = Math.max(nextId, account.id + 1)
}

export async function fetchAccounts(): Promise<AccountListItem[]> {
  return delay([...accounts])
}

export async function createAccount(payload: CreateAccountPayload): Promise<AccountListItem> {
  if (payload.role !== 'owner' && payload.role !== 'secretary') {
    throw new Error('Role must be owner or secretary')
  }

  const account: AccountListItem = {
    id: nextId++,
    role: payload.role,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
  }

  accounts = [account, ...accounts]

  return delay(account)
}

export async function updateAccountRole(id: number, role: AccountListItem['role']): Promise<AccountListItem> {
  const account = accounts.find((item) => item.id === id)

  if (!account) {
    throw new Error('Account not found')
  }

  account.role = role

  return delay({ ...account })
}

let profile: ProfileInfo = { firstName: 'Alexandra', lastName: 'Reyes' }

export async function fetchProfile(): Promise<ProfileInfo> {
  return delay({ ...profile })
}

export async function updateProfileInfo(payload: ProfileInfo): Promise<ProfileInfo> {
  profile = { ...payload }

  return delay({ ...profile })
}

let credentials: CredentialsInfo = { email: 'alexandra.reyes@cpro.com' }

export async function fetchCredentials(): Promise<CredentialsInfo> {
  return delay({ ...credentials })
}

export async function updateAccountCredentials(payload: UpdateCredentialsPayload): Promise<CredentialsInfo> {
  credentials = { email: payload.email }

  // password is intentionally not persisted anywhere in this prototype.
  return delay({ ...credentials })
}
