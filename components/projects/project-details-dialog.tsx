"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { TaskCard } from "../tasks/task-card"
import { CreateTaskDialog } from "../tasks/create-task-dialog"
import { useToast } from "@/components/ui/use-toast"
import { usePermission } from "@/hooks/use-permission"
import useSWR from "swr"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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

type Task = {
  _id: string
  title: string
  description: string
  status: "not-started" | "in-progress" | "completed"
  project: string
  assignedTo: {
    _id: string
    name: string
    email: string
  }
  createdBy: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface ProjectDetailsDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ProjectDetailsDialog({ project, open, onOpenChange }: ProjectDetailsDialogProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { isAdmin, hasPermission } = usePermission()
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const { data: tasks, error, mutate } = useSWR<Task[]>(open ? `/api/tasks?projectId=${project._id}` : null, fetcher)

  const isLoading = !tasks && !error && open

  const statusColors = {
    "not-started": "bg-yellow-500",
    "in-progress": "bg-blue-500",
    completed: "bg-green-500",
  }

  const statusLabels = {
    "not-started": "Not Started",
    "in-progress": "In Progress",
    completed: "Completed",
  }

  const canCreateTask = isAdmin || hasPermission("tasks", "create")
  const canUpdateTask = isAdmin || hasPermission("tasks", "update")
  const canDeleteTask = isAdmin || hasPermission("tasks", "delete")

  const handleCreateTask = async (taskData: {
    title: string
    description: string
    assignedToId: string
    status: "not-started" | "in-progress" | "completed"
  }) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...taskData,
          projectId: project._id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create task")
      }

      mutate()
      setIsCreateTaskOpen(false)
      toast({
        title: "Success",
        description: "Task created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: "not-started" | "in-progress" | "completed") => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task status")
      }

      mutate()
      toast({
        title: "Success",
        description: "Task status updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      mutate()
      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{project.title}</span>
              <Badge variant="outline" className={`${statusColors[project.status]} text-white`}>
                {statusLabels[project.status]}
              </Badge>
            </DialogTitle>
            <DialogDescription>Created on {new Date(project.createdAt).toLocaleDateString()}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="environment">Environment Keys</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4 pt-4">
              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Deadline</h3>
                <p className="mt-1 text-sm text-muted-foreground">{new Date(project.deadline).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Status</h3>
                <p className="mt-1 text-sm text-muted-foreground">{statusLabels[project.status]}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Team Members</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.assignedUsers.map((user) => (
                    <div key={user._id} className="flex items-center gap-2 rounded-md border p-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="tasks" className="space-y-4 pt-4">
              {canCreateTask && (
                <div className="flex justify-end">
                  <Button onClick={() => setIsCreateTaskOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Task
                  </Button>
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <p className="text-center text-muted-foreground">Error loading tasks. Please try again.</p>
              ) : tasks?.length === 0 ? (
                <p className="text-center text-muted-foreground">No tasks found for this project.</p>
              ) : (
                <div className="space-y-4">
                  {tasks?.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      canEdit={isAdmin || hasPermission("tasks", "update")}
                      canDelete={isAdmin || hasPermission("tasks", "delete")}
                      onUpdateStatus={handleUpdateTaskStatus}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="environment" className="space-y-4 pt-4">
              {isAdmin ? (
                <div className="rounded-md border p-4">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: project.environmentKeys || "<p>No environment keys added yet.</p>",
                    }}
                  />
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Only administrators can view environment keys.</p>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {canCreateTask && (
        <CreateTaskDialog
          projectId={project._id}
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
          onSubmit={handleCreateTask}
        />
      )}
    </>
  )
}

