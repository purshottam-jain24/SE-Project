"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { UserCard } from "./user-card"
import { useToast } from "@/components/ui/use-toast"
import useSWR from "swr"

type User = {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function UsersList() {
  const { toast } = useToast()

  const { data: users, error, mutate } = useSWR<User[]>("/api/users", fetcher)

  const isLoading = !users && !error

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user role")
      }

      mutate()
      toast({
        title: "Success",
        description: "User role updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
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
            <p className="text-muted-foreground">Error loading users. Please try again.</p>
          </CardContent>
        </Card>
      ) : users?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No users found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users?.map((user) => (
            <UserCard key={user._id} user={user} onUpdateRole={handleUpdateUserRole} />
          ))}
        </div>
      )}
    </div>
  )
}

