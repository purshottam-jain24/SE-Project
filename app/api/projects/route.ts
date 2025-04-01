import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "@/lib/db"
import { Project } from "@/lib/models/project"
import { authOptions } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { logActivity } from "@/lib/activity-logger"
import mongoose from "mongoose"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    let query = {}

    // If user is not admin, only show projects assigned to them
    if (!session.user.role.isAdmin) {
      query = { assignedUsers: new mongoose.Types.ObjectId(session.user.id) }
    }

    // If userId is provided and user is admin, filter by that userId
    if (userId && session.user.role.isAdmin) {
      query = { assignedUsers: new mongoose.Types.ObjectId(userId) }
    }

    const projects = await Project.find(query)
      .populate("assignedUsers", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.role.isAdmin && !hasPermission(session.user.role.permissions, "projects", "create")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const { title, description, deadline, status, environmentKeys, assignedUsers } = await req.json()

    // Validate input
    if (!title || !description || !deadline || !assignedUsers || !assignedUsers.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    const project = await Project.create({
      title,
      description,
      deadline: new Date(deadline),
      status: status || "not-started",
      environmentKeys: environmentKeys || "",
      assignedUsers: assignedUsers.map((id: string) => new mongoose.Types.ObjectId(id)),
      createdBy: new mongoose.Types.ObjectId(session.user.id),
    })

    // Log activity
    await logActivity(session.user.id, "create", "project", project._id.toString(), `Created project: ${title}`)

    const populatedProject = await Project.findById(project._id)
      .populate("assignedUsers", "name email")
      .populate("createdBy", "name email")

    return NextResponse.json(populatedProject, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

