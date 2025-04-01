"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash, Edit, Shield } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { EditRoleDialog } from "./edit-role-dialog"
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

type Permission = {
  resource: string
  actions: string[]
}

type Role = {
  _id: string
  name: string
  description: string
  permissions: Permission[]
  isAdmin: boolean
  createdAt: string
  updatedAt: string
}

interface RoleCardProps {
  role: Role
  onDelete: (id: string) => void
}

export function RoleCard({ role, onDelete }: RoleCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{role.name}</CardTitle>
            {role.isAdmin && <Badge variant="default">Admin</Badge>}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground">{role.description}</p>
          <div className="mt-4">
            <h4 className="text-sm font-medium">Permissions:</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {role.permissions.map((permission) => (
                <Badge key={permission.resource} variant="outline" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {permission.resource} ({permission.actions.join(", ")})
                </Badge>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Created {formatDistanceToNow(new Date(role.createdAt), { addSuffix: true })}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
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
                  This action cannot be undone. This will permanently delete the role and could affect users assigned to
                  this role.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(role._id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>

      <EditRoleDialog role={role} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </>
  )
}

