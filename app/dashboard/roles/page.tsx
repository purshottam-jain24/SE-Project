import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { RolesList } from "@/components/roles/roles-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Roles | IT Project Management Portal",
  description: "Manage roles and permissions",
}

export default async function RolesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (!session.user.role.isAdmin) {
    redirect("/dashboard")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage roles and their permissions</p>
        </div>
        <RolesList />
      </div>
    </DashboardLayout>
  )
}

