import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "@/lib/db"
import { ActivityLog } from "@/lib/models/activity-log"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.role.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const resource = searchParams.get("resource")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let query = {}

    if (userId) {
      query = { ...query, user: userId }
    }

    if (resource) {
      query = { ...query, resource }
    }

    const logs = await ActivityLog.find(query).populate("user", "name email").sort({ timestamp: -1 }).limit(limit)

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Error fetching activity logs:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

