"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Loader2 } from "lucide-react"
import { RoleCard } from "./role-card"
import { CreateRoleDialog } from "./create-role-dialog"
import { useToast } from "@/components/ui/use-toast"
import useSWR from "swr"

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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function RolesList() {
  const { toast } = useToast()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: roles, error, mutate } = useSWR<Role[]>("/api/admin/roles", fetcher)

  const isLoading = !roles && !error

  const handleCreateRole = async (roleData: {
    name: string
    description: string
    permissions: Permission[]
    isAdmin: boolean
  }) => {
    try {
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      })

      if (!response.ok) {
        throw new Error("Failed to create role")
      }

      mutate()
      setIsCreateDialogOpen(false)
      toast({
        title: "Success",
        description: "Role created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete role")
      }

      mutate()
      toast({
        title: "Success",
        description: "Role deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete role",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Role
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Error loading roles. Please try again.</p>
          </CardContent>
        </Card>
      ) : roles?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No roles found. Create your first role!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles?.map((role) => (
            <RoleCard key={role._id} role={role} onDelete={handleDeleteRole} />
          ))}
        </div>
      )}

      <CreateRoleDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSubmit={handleCreateRole} />
    </div>
  )
}

