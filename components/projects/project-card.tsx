"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash, Edit, Eye, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ProjectDetailsDialog } from "./project-details-dialog"
import { EditProjectDialog } from "./edit-project-dialog"
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

interface ProjectCardProps {
  project: Project
  canEdit: boolean
  canDelete: boolean
  onDelete: (id: string) => void
}

export function ProjectCard({ project, canEdit, canDelete, onDelete }: ProjectCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
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

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-1 text-lg">{project.title}</CardTitle>
            <Badge variant="outline" className={`${statusColors[project.status]} text-white`}>
              {statusLabels[project.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{project.assignedUsers.length} team members</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Deadline: {new Date(project.deadline).toLocaleDateString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={() => setIsDetailsOpen(true)}>
            <Eye className="mr-2 h-4 w-4" /> View
          </Button>
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
                      This action cannot be undone. This will permanently delete the project and all associated tasks.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(project._id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardFooter>
      </Card>

      <ProjectDetailsDialog project={project} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />

      {canEdit && <EditProjectDialog project={project} open={isEditOpen} onOpenChange={setIsEditOpen} />}
    </>
  )
}

