"use client"

import type React from "react"

import { useState } from "react"
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

type Permission = {
  resource: string
  actions: string[]
}

interface CreateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    description: string
    permissions: Permission[]
    isAdmin: boolean
  }) => void
}

export function CreateRoleDialog({ open, onOpenChange, onSubmit }: CreateRoleDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [
      {
        resource: "projects",
        actions: ["read"],
      },
      {
        resource: "tasks",
        actions: ["read"],
      },
    ] as Permission[],
    isAdmin: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      await onSubmit(formData)
      setFormData({
        name: "",
        description: "",
        permissions: [
          {
            resource: "projects",
            actions: ["read"],
          },
          {
            resource: "tasks",
            actions: ["read"],
          },
        ],
        isAdmin: false,
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
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>Define a new role with specific permissions.</DialogDescription>
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
              {isSubmitting ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

