"use client"

import { useSession } from "next-auth/react"

export function usePermission() {
  const { data: session } = useSession()

  const hasPermission = (resource: string, action: string): boolean => {
    if (!session) return false

    // Admin has all permissions
    if (session.user.role.isAdmin) return true

    // Check specific permission
    const permission = session.user.role.permissions.find((p) => p.resource === resource)

    if (!permission) return false

    return permission.actions.includes(action)
  }

  return {
    hasPermission,
    isAdmin: session?.user.role.isAdmin || false,
    roleName: session?.user.role.name || "",
  }
}

