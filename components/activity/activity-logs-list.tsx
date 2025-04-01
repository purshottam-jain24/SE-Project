"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import useSWR from "swr"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type ActivityLog = {
  _id: string
  user: {
    _id: string
    name: string
    email: string
  }
  action: string
  resource: string
  resourceId: string
  details: string
  timestamp: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ActivityLogsList() {
  const { toast } = useToast()
  const [resourceFilter, setResourceFilter] = useState<string>("")

  const { data: logs, error } = useSWR<ActivityLog[]>(
    `/api/activity-logs${resourceFilter ? `?resource=${resourceFilter}` : ""}`,
    fetcher,
  )

  const isLoading = !logs && !error

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <div className="w-64">
          <Label htmlFor="resourceFilter">Filter by Resource</Label>
          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger id="resourceFilter">
              <SelectValue placeholder="All resources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All resources</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="role">Roles</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Error loading activity logs. Please try again.</p>
          </CardContent>
        </Card>
      ) : logs?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No activity logs found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs?.map((log) => (
                <div key={log._id} className="flex flex-col space-y-1 border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.user.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {log.action} a {log.resource}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  {log.details && <p className="text-sm text-muted-foreground">{log.details}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

