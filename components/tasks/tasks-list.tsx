"use client"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { TaskCard } from "./task-card"
import { useToast } from "@/components/ui/use-toast"
import { usePermission } from "@/hooks/use-permission"
import useSWR from "swr"

type Task = {
  _id: string
  title: string
  description: string
  status: "not-started" | "in-progress" | "completed"
  project: {
    _id: string
    title: string
  }
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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function TasksList() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { isAdmin, hasPermission } = usePermission()

  const { data: tasks, error, mutate } = useSWR<Task[]>("/api/tasks", fetcher)

  const isLoading = !tasks && !error

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
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Error loading tasks. Please try again.</p>
          </CardContent>
        </Card>
      ) : tasks?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No tasks assigned to you.</p>
          </CardContent>
        </Card>
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
    </div>
  )
}

