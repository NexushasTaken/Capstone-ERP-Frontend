import { ChartNoAxesCombined, Package, PackageOpen, Warehouse } from 'lucide-react'

export const buttonNav = [
    {
        name: 'Orders',
        icon: Package,
        link: '/dashboard/orders'
    },
    {
        name: 'Sales',
        icon: ChartNoAxesCombined,
        link: '/dashboard/sales'
    },
    {
        name: 'Inventory',
        icon: Warehouse,
        link: '/dashboard/inventory'
    },
    {
        name: 'Product',
        icon: PackageOpen,
        link: '/dashboard/product'
    },
]
