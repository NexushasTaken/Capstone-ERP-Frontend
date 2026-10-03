import type { Role } from '@/app/types/profile'

interface RolePermissions {
  routes: string[]
  actions: string[]
}

// Frontend-only RBAC: hides UI the role can't use. Not a security boundary.
const permissions: Record<Role, RolePermissions> = {
  owner: {
    routes: [
      '/dashboard',
      '/dashboard/orders',
      '/dashboard/sales',
      '/dashboard/inventory',
      '/dashboard/product',
      '/dashboard/category',
      '/dashboard/driver',
    ],
    actions: [
      'category:add',
      'category:delete',
      'driver:add',
      'driver:delete',
      'product:add',
      'inventory:add',
      'inventory:restock',
      'warehouse:add',
      'warehouse:delete',
    ],
  },
  secretary: {
    routes: [
      '/dashboard',
      '/dashboard/orders',
      '/dashboard/inventory',
      '/dashboard/product',
      '/dashboard/category',
      '/dashboard/driver',
    ],
    actions: [],
  },
}

// '/dashboard/orders/123' -> '/dashboard/orders', so sub-pages follow their section.
function toSection(pathname: string) {
  return pathname.split('/').slice(0, 3).join('/')
}

// `permission` is either a route ('/dashboard/sales') or an action ('category:add').
export function can(role: string | null | undefined, permission: string): boolean {
  // The dashboard home is open to every logged-in user, whatever their role.
  if (permission === '/dashboard') return true

  const key = role?.toLowerCase() ?? ''
  if (!Object.keys(permissions).includes(key)) return false

  const rolePermissions = permissions[key as Role]

  if (permission.startsWith('/')) {
    return rolePermissions.routes.includes(toSection(permission))
  }

  return rolePermissions.actions.includes(permission)
}
