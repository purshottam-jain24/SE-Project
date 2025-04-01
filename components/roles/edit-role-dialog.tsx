"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { PermissionsEditor } from "./permissions-editor"
import { useToast } from "@/components/ui/use-toast"

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

interface EditRoleDialogProps {
  role: Role
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditRoleDialog({ role, open, onOpenChange }: EditRoleDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as Permission[],
    isAdmin: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (role && open) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isAdmin: role.isAdmin,
      })
    }
  }, [role, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdminChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isAdmin: checked }))
  }

  const handlePermissionsChange = (permissions: Permission[]) => {
    setFormData((prev) => ({ ...prev, permissions }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/roles/${role._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update role")
      }

      toast({
        title: "Success",
        description: "Role updated successfully",
      })
      onOpenChange(false)
      // Force a reload to update the UI
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update role details and permissions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Role Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isAdmin" checked={formData.isAdmin} onCheckedChange={handleAdminChange} />
              <Label htmlFor="isAdmin">Admin Role (has all permissions)</Label>
            </div>

            {!formData.isAdmin && (
              <div className="grid gap-2">
                <Label>Permissions</Label>
                <PermissionsEditor permissions={formData.permissions} onChange={handlePermissionsChange} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

