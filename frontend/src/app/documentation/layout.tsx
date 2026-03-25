import { DashboardLayout } from "@/components/layout/dashboard-layout"
import AuthProvider from "@/features/users/components/auth-provider"

export default function DocumentationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  )
}
