"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Permission = {
  resource: string
  actions: string[]
}

interface PermissionsEditorProps {
  permissions: Permission[]
  onChange: (permissions: Permission[]) => void
}

// Available resources and actions
const availableResources = ["projects", "tasks", "users", "roles"]
const availableActions = ["create", "read", "update", "delete"]

export function PermissionsEditor({ permissions, onChange }: PermissionsEditorProps) {
  const [newResource, setNewResource] = useState("")

  const handleAddResource = () => {
    if (!newResource || permissions.some((p) => p.resource === newResource)) {
      return
    }

    const updatedPermissions = [
      ...permissions,
      {
        resource: newResource,
        actions: ["read"],
      },
    ]

    onChange(updatedPermissions)
    setNewResource("")
  }

  const handleRemoveResource = (resource: string) => {
    const updatedPermissions = permissions.filter((p) => p.resource !== resource)
    onChange(updatedPermissions)
  }

  const handleActionChange = (resource: string, action: string, checked: boolean) => {
    const updatedPermissions = permissions.map((p) => {
      if (p.resource === resource) {
        return {
          ...p,
          actions: checked ? [...p.actions, action] : p.actions.filter((a) => a !== action),
        }
      }
      return p
    })

    onChange(updatedPermissions)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="newResource">Add Resource</Label>
          <Select value={newResource} onValueChange={setNewResource}>
            <SelectTrigger id="newResource">
              <SelectValue placeholder="Select resource" />
            </SelectTrigger>
            <SelectContent>
              {availableResources
                .filter((resource) => !permissions.some((p) => p.resource === resource))
                .map((resource) => (
                  <SelectItem key={resource} value={resource}>
                    {resource}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={handleAddResource} disabled={!newResource}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {permissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No permissions added yet.</p>
      ) : (
        <div className="space-y-3">
          {permissions.map((permission) => (
            <Card key={permission.resource}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium capitalize">{permission.resource}</h4>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveResource(permission.resource)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-4">
                  {availableActions.map((action) => (
                    <div key={`${permission.resource}-${action}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${permission.resource}-${action}`}
                        checked={permission.actions.includes(action)}
                        onCheckedChange={(checked) =>
                          handleActionChange(permission.resource, action, checked as boolean)
                        }
                      />
                      <Label htmlFor={`${permission.resource}-${action}`} className="capitalize">
                        {action}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

