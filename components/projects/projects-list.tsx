"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Loader2 } from "lucide-react"
import { ProjectCard } from "./project-card"
import { CreateProjectDialog } from "./create-project-dialog"
import { useToast } from "@/components/ui/use-toast"
import { usePermission } from "@/hooks/use-permission"
import useSWR from "swr"

type User = {
  _id: string
  name: string
  email: string
}

type Project = {
  _id: string
  title: string
  description: string
  deadline: string
  status: "not-started" | "in-progress" | "completed"
  environmentKeys: string
  assignedUsers: User[]
  createdBy: User
  createdAt: string
  updatedAt: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ProjectsList() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { isAdmin, hasPermission } = usePermission()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: projects, error, mutate } = useSWR<Project[]>("/api/projects", fetcher)

  const isLoading = !projects && !error

  const handleCreateProject = async (projectData: {
    title: string
    description: string
    deadline: string
    status: "not-started" | "in-progress" | "completed"
    environmentKeys: string
    assignedUsers: string[]
  }) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        throw new Error("Failed to create project")
      }

      mutate()
      setIsCreateDialogOpen(false)
      toast({
        title: "Success",
        description: "Project created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      mutate()
      toast({
        title: "Success",
        description: "Project deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      })
    }
  }

  const canCreateProject = isAdmin || hasPermission("projects", "create")

  return (
    <div className="space-y-6">
      {canCreateProject && (
        <div className="flex justify-end">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Project
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Error loading projects. Please try again.</p>
          </CardContent>
        </Card>
      ) : projects?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No projects found. {canCreateProject && "Create your first project!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              canEdit={isAdmin || hasPermission("projects", "update")}
              canDelete={isAdmin || hasPermission("projects", "delete")}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {canCreateProject && (
        <CreateProjectDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  )
}

