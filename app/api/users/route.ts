import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "@/lib/db"
import { User } from "@/lib/models/user"
import { authOptions } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.role.isAdmin && !hasPermission(session.user.role.permissions, "users", "read")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    await dbConnect()

    // Get all users except the current user
    const users = await User.find({ _id: { $ne: session.user.id } })
      .select("-password")
      .populate("role", "name isAdmin")
      .sort({ createdAt: -1 })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

