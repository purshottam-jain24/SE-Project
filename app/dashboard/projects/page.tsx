import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { ProjectsList } from "@/components/projects/projects-list"
import { TasksList } from "@/components/tasks/tasks-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Projects | IT Project Management Portal",
  description: "Manage your projects and tasks",
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const tabs = [
    {
      value: "projects",
      label: "Projects",
      content: <ProjectsList />,
    },
    {
      value: "tasks",
      label: "Tasks",
      content: <TasksList />,
    },
  ]

  return (
    <DashboardLayout tabs={tabs}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects & Tasks</h1>
          <p className="text-muted-foreground">Manage your projects and tasks</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
