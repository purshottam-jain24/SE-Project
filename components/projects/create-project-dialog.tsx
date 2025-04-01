"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HtmlEditor } from "@/components/html-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import useSWR from "swr"

type User = {
  _id: string
  name: string
  email: string
  role: {
    _id: string
    name: string
  }
}

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    description: string
    deadline: string
    status: "not-started" | "in-progress" | "completed"
    environmentKeys: string
    assignedUsers: string[]
  }) => void
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function CreateProjectDialog({ open, onOpenChange, onSubmit }: CreateProjectDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    status: "not-started" as "not-started" | "in-progress" | "completed",
    environmentKeys: "",
    assignedUsers: [] as string[],
  })
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: users, error } = useSWR<User[]>(open ? "/api/users" : null, fetcher)

  const isLoading = !users && !error && open

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: "not-started" | "in-progress" | "completed") => {
    setFormData((prev) => ({ ...prev, status: value }))
  }

  const handleEnvironmentKeysChange = (value: string) => {
    setFormData((prev) => ({ ...prev, environmentKeys: value }))
  }

  const handleUserToggle = (userId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      assignedUsers: checked ? [...prev.assignedUsers, userId] : prev.assignedUsers.filter((id) => id !== userId),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.assignedUsers.length === 0) {
      alert("Please assign at least one user to the project")
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      setFormData({
        title: "",
        description: "",
        deadline: "",
        status: "not-started",
        environmentKeys: "",
        assignedUsers: [],
      })
      setActiveTab("details")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Fill in the details to create a new project.</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Project Details</TabsTrigger>
              <TabsTrigger value="team">Team Members</TabsTrigger>
              <TabsTrigger value="environment">Environment Keys</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
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
              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={() => setActiveTab("team")}>
                  Next: Team Members
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label>Assign Team Members</Label>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading users...</span>
                  </div>
                ) : error ? (
                  <p className="text-sm text-destructive">Error loading users</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-4">
                    {users?.map((user) => (
                      <div key={user._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`user-${user._id}`}
                          checked={formData.assignedUsers.includes(user._id)}
                          onCheckedChange={(checked) => handleUserToggle(user._id, checked as boolean)}
                        />
                        <Label htmlFor={`user-${user._id}`} className="flex flex-col">
                          <span>{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.email} ({user.role.name})
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab("environment")}>
                  Next: Environment Keys
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="environment" className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="environmentKeys">Environment Keys</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add API keys, secrets, and other sensitive information. Only administrators can view this content.
                </p>
                <HtmlEditor
                  value={formData.environmentKeys}
                  onChange={handleEnvironmentKeysChange}
                  placeholder="Add environment keys, API credentials, or other sensitive information here..."
                />
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("team")}>
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  )
}

