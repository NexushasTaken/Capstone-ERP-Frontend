import {
  Boxes,
  FileText,
  ChartNoAxesCombined,
  History,
  LucideIcon,
  Package,
  PackageOpen,
  Ruler,
  ShoppingCart,
  Tags,
  TrendingUp,
  Truck,
  UserCog,
  Users,
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

// Operations: day-to-day work. Insights: reading what happened. Records: the lists the rest is built from.
export const navGroups: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { name: "Orders", icon: Package, link: "/dashboard/orders" },
      { name: "Sales", icon: ChartNoAxesCombined, link: "/dashboard/sales" },
      { name: "Purchases", icon: ShoppingCart, link: "/dashboard/purchases" },
      { name: "Inventory", icon: Boxes, link: "/dashboard/inventory" },
    ],
  },
  {
    label: "Insights",
    items: [
      { name: "Demand Forecast", icon: TrendingUp, link: "/dashboard/forecast" },
      { name: "Reports", icon: FileText, link: "/dashboard/reports" },
      { name: "Audit logs", icon: History, link: "/dashboard/audit-logs" },
    ],
  },
  {
    label: "Records",
    items: [
      { name: "Product", icon: PackageOpen, link: "/dashboard/product" },
      { name: "Category", icon: Tags, link: "/dashboard/category" },
      { name: "Unit", icon: Ruler, link: "/dashboard/unit" },
      { name: "Driver", icon: Truck, link: "/dashboard/driver" },
    ],
  },
  {
    label: "Account Manager",
    items: [
      { name: "Account Settings", icon: UserCog, link: "/dashboard/account-settings" },
      { name: "Accounts", icon: Users, link: "/dashboard/accounts" },
    ],
  },
]
