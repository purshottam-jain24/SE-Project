import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "@/lib/db"
import { Role } from "@/lib/models/role"
import { authOptions } from "@/lib/auth"
import { logActivity } from "@/lib/activity-logger"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.role.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const roles = await Role.find().sort({ createdAt: -1 })

    return NextResponse.json(roles)
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.role.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, permissions, isAdmin } = await req.json()

    // Validate input
    if (!name || !description || !permissions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    // Check if role already exists
    const existingRole = await Role.findOne({ name })
    if (existingRole) {
      return NextResponse.json({ error: "Role already exists" }, { status: 409 })
    }

    // Create role
    const role = await Role.create({
      name,
      description,
      permissions,
      isAdmin: isAdmin || false,
    })

    // Log activity
    await logActivity(session.user.id, "create", "role", role._id.toString(), `Created role: ${name}`)

    return NextResponse.json(role, { status: 201 })
  } catch (error) {
    console.error("Error creating role:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

