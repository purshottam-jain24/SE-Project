import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { ActivityLogsList } from "@/components/activity/activity-logs-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Activity Logs | IT Project Management Portal",
  description: "View system activity logs",
}

export default async function ActivityLogsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground">View system activity and audit trail</p>
        </div>
        <ActivityLogsList />
      </div>
    </DashboardLayout>
  )
}

