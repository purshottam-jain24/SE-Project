import { getSession } from "next-auth/react"

export async function checkPermission(req: Request, resource: string, action: string): Promise<boolean> {
  const session = await getSession({ req })

  if (!session) {
    return false
  }

  // Admin has all permissions
  if (session.user.role.isAdmin) {
    return true
  }

  // Check if user has the specific permission
  const permission = session.user.role.permissions.find((p) => p.resource === resource)

  if (!permission) {
    return false
  }

  return permission.actions.includes(action)
}

export function hasPermission(
  userPermissions: { resource: string; actions: string[] }[],
  resource: string,
  action: string,
): boolean {
  const permission = userPermissions.find((p) => p.resource === resource)

  if (!permission) {
    return false
  }

  return permission.actions.includes(action)
}

