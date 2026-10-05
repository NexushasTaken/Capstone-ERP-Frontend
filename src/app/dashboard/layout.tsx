import AuthGuard from '@/app/dashboard/_components/AuthGuard'
import DashboardShell from '@/app/dashboard/_components/DashboardShell'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  )
}
