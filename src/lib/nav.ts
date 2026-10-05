import {
  ChartNoAxesCombined,
  History,
  LucideIcon,
  Package,
  PackageOpen,
  Truck,
  UserCog,
  Users,
  Warehouse,
} from "lucide-react"

export interface NavItem {
  name: string
  icon: LucideIcon
  link: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Operations",
    items: [
      {
        name: "Orders",
        icon: Package,
        link: "/dashboard/orders",
      },
      {
        name: "Inventory",
        icon: Warehouse,
        link: "/dashboard/inventory",
      },
    ],
  },
  {
    label: "Basic Informations",
    items: [
      {
        name: "Product",
        icon: PackageOpen,
        link: "/dashboard/product",
      },
      {
        name: "Category",
        icon: PackageOpen,
        link: "/dashboard/category",
      },
      {
        name: "Driver",
        icon: Truck,
        link: "/dashboard/driver",
      },
      {
        name: "Audit logs",
        icon: History,
        link: "/dashboard/audit-logs",
      },
      {
        name: "Sales",
        icon: ChartNoAxesCombined,
        link: "/dashboard/sales",
      },
    ],
  },
  {
    label: "Account Manager",
    items: [
      {
        name: "Account Settings",
        icon: UserCog,
        link: "/dashboard/account-settings",
      },
      {
        name: "Accounts",
        icon: Users,
        link: "/dashboard/accounts",
      },
    ],
  },
]
