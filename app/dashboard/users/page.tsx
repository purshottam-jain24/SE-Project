import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { UsersList } from "@/components/users/users-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Users | Project Management Portal",
  description: "Manage users",
}

export default async function UsersPage() {
  const session = await getServerSession(authOptions) as { user: { role: string } } | null

  if (!session) {
    redirect("/login")
  }

  // if (session.user.role !== "admin") {
  //   redirect("/dashboard")
  // }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage users and their roles</p>
        </div>
        <UsersList />
      </div>
    </DashboardLayout>
  )
}

