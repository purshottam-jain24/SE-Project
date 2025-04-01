import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "@/lib/db"
import { User } from "@/lib/models/user"
import { authOptions } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { logActivity } from "@/lib/activity-logger"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Users can only view their own profile, admins can view any profile
    if (
      !session.user.role.isAdmin &&
      session.user.id !== params.id &&
      !hasPermission(session.user.role.permissions, "users", "read")
    ) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    await dbConnect()

    const user = await User.findById(params.id).select("-password").populate("role", "name isAdmin permissions")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins or the user themselves can update their profile
    if (
      !session.user.role.isAdmin &&
      session.user.id !== params.id &&
      !hasPermission(session.user.role.permissions, "users", "update")
    ) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    await dbConnect()

    const { name, roleId } = await req.json()

    // Only admins can update roles
    if (roleId && !session.user.role.isAdmin) {
      return NextResponse.json({ error: "Only admins can update user roles" }, { status: 403 })
    }

    const updateData: { name?: string; role?: string } = {}
    if (name) updateData.name = name
    if (roleId && session.user.role.isAdmin) updateData.role = roleId

    const updatedUser = await User.findByIdAndUpdate(params.id, updateData, { new: true })
      .select("-password")
      .populate("role", "name isAdmin permissions")

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Log activity
    await logActivity(session.user.id, "update", "user", params.id, `Updated user: ${updatedUser.name}`)

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

