import { ActivityLog } from "./models/activity-log"
import dbConnect from "./db"

export async function logActivity(userId: string, action: string, resource: string, resourceId: string, details = "") {
  await dbConnect()

  await ActivityLog.create({
    user: userId,
    action,
    resource,
    resourceId,
    details,
    timestamp: new Date(),
  })
}

