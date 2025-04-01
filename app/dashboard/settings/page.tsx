import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { UserSettings } from "@/components/settings/user-settings"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings | Project Management Portal",
  description: "User settings",
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
        <UserSettings userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}

