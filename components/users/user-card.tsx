"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type User = {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface UserCardProps {
  user: User
  onUpdateRole: (id: string, role: string) => void
}

export function UserCard({ user, onUpdateRole }: UserCardProps) {
  const [role, setRole] = useState(user.role)

  const handleRoleChange = (value: string) => {
    setRole(value)
    onUpdateRole(user._id, value)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{user.name}</CardTitle>
          <Badge variant={user.role === "admin" ? "default" : "outline"}>
            {user.role === "admin" ? "Admin" : "User"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t p-4 pt-2">
        <div className="grid w-full gap-2">
          <Label htmlFor={`role-${user._id}`}>Role</Label>
          <Select value={role} onValueChange={handleRoleChange}>
            <SelectTrigger id={`role-${user._id}`}>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardFooter>
    </Card>
  )
}

