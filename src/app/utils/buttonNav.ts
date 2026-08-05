import { ChartNoAxesCombined, Package, Settings, Warehouse } from 'lucide-react'

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
        name: 'Settings',
        icon: Settings,
        link: '/dashboard'
    },
]
