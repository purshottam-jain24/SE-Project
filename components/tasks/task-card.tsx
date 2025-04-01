"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash, Edit, Briefcase } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { EditTaskDialog } from "./edit-task-dialog"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

interface TaskCardProps {
  task: Task
  canEdit: boolean
  canDelete: boolean
  onUpdateStatus: (id: string, status: "not-started" | "in-progress" | "completed") => void
  onDelete: (id: string) => void
}

export function TaskCard({ task, canEdit, canDelete, onUpdateStatus, onDelete }: TaskCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

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

  const handleStatusChange = (status: "not-started" | "in-progress" | "completed") => {
    onUpdateStatus(task._id, status)
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{task.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={`${statusColors[task.status]} text-white`}>
                  {statusLabels[task.status]}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Briefcase className="h-3 w-3" />
                  <span>{task.project.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">Assigned to: {task?.assignedTo?.name}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4 pt-2">
          <div className="flex space-x-2">
            {task.status !== "not-started" && (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange("not-started")}>
                Mark as Not Started
              </Button>
            )}
            {task.status !== "in-progress" && (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange("in-progress")}>
                Mark as In Progress
              </Button>
            )}
            {task.status !== "completed" && (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange("completed")}>
                Mark as Completed
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the task.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(task._id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardFooter>
      </Card>

      {canEdit && <EditTaskDialog task={task} open={isEditOpen} onOpenChange={setIsEditOpen} />}
    </>
  )
}

