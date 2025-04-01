import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "@/lib/db"
import { Role } from "@/lib/models/role"
import { authOptions } from "@/lib/auth"
import { logActivity } from "@/lib/activity-logger"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.role.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const role = await Role.findById(params.id)

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    return NextResponse.json(role)
  } catch (error) {
    console.error("Error fetching role:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.role.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { name, description, permissions, isAdmin } = await req.json()

    // Validate input
    if (!name || !description || !permissions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update role
    const updatedRole = await Role.findByIdAndUpdate(
      params.id,
      {
        name,
        description,
        permissions,
        isAdmin: isAdmin || false,
      },
      { new: true },
    )

    if (!updatedRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    // Log activity
    await logActivity(session.user.id, "update", "role", params.id, `Updated role: ${name}`)

    return NextResponse.json(updatedRole)
  } catch (error) {
    console.error("Error updating role:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.role.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const role = await Role.findById(params.id)

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    // Check if role is in use
    const User = (await import("@/lib/models/user")).User
    const usersWithRole = await User.countDocuments({ role: params.id })

    if (usersWithRole > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete role that is assigned to users",
        },
        { status: 400 },
      )
    }

    await Role.findByIdAndDelete(params.id)

    // Log activity
    await logActivity(session.user.id, "delete", "role", params.id, `Deleted role: ${role.name}`)

    return NextResponse.json({ message: "Role deleted successfully" })
  } catch (error) {
    console.error("Error deleting role:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

