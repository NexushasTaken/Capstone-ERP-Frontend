import { ChartNoAxesCombined, Package, PackageOpen, Warehouse, Layers } from 'lucide-react'

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
    {
        name: 'Category',
        icon: Layers,
        link: '/dashboard/category'
    },
]
