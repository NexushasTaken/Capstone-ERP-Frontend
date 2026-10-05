import type { Role } from "@/types/profile"

interface RolePermissions {
  routes: string[]
  actions: string[]
}

// Frontend-only RBAC: hides UI the role can't use. Not a security boundary.
const permissions: Record<Role, RolePermissions> = {
  owner: {
    routes: [
      "/dashboard",
      "/dashboard/orders",
      "/dashboard/sales",
      "/dashboard/inventory",
      "/dashboard/product",
      "/dashboard/category",
      "/dashboard/driver",
      "/dashboard/audit-logs",
      "/dashboard/account-settings",
      "/dashboard/accounts",
    ],
    // Keys are `<module>:<button value>`, matching the StatusAction values in each page.
    actions: [
      "category:add",
      "category:edit",
      "category:delete",
      "driver:add",
      "driver:update",
      "driver:delete",
      "product:add",
      "product:edit",
      "product:delete",
      "inventory:add",
      "inventory:edit",
      "inventory:delete",
      "inventory:restock",
      "inventory:damage",
      "warehouse:add",
      "warehouse:edit",
      "warehouse:delete",
      "account:create",
      "account:edit",
    ],
  },
  secretary: {
    routes: [
      "/dashboard",
      "/dashboard/orders",
      "/dashboard/inventory",
      "/dashboard/product",
      "/dashboard/category",
      "/dashboard/driver",
      "/dashboard/audit-logs",
      "/dashboard/account-settings",
    ],
    actions: [],
  },
}

// '/dashboard/orders/123' -> '/dashboard/orders', so sub-pages follow their section.
function toSection(pathname: string) {
  return pathname.split("/").slice(0, 3).join("/")
}

// `permission` is either a route ('/dashboard/sales') or an action ('category:add').
export function can(role: string | null | undefined, permission: string): boolean {
  // The dashboard home is open to every logged-in user, whatever their role.
  if (permission === "/dashboard") return true

  const key = role?.toLowerCase() ?? ""
  if (!Object.keys(permissions).includes(key)) return false

  const rolePermissions = permissions[key as Role]

  if (permission.startsWith("/")) {
    return rolePermissions.routes.includes(toSection(permission))
  }

  return rolePermissions.actions.includes(permission)
}

// Keeps only the row-menu actions (edit, delete, …) the role may use in `module`.
export function allowedActions<T extends { value: string }>(
  role: string | null | undefined,
  module: string,
  actions: T[],
): T[] {
  return actions.filter((action) => can(role, `${module}:${action.value}`))
}
