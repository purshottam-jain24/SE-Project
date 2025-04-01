import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "@/lib/db"
import { Project } from "@/lib/models/project"
import { authOptions } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { logActivity } from "@/lib/activity-logger"
import mongoose from "mongoose"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const project = await Project.findById(params.id)
      .populate("assignedUsers", "name email")
      .populate("createdBy", "name email")

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if user has access to this project
    if (!session.user.role.isAdmin && !project.assignedUsers.some((user) => user._id.toString() === session.user.id)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const project = await Project.findById(params.id)

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if user has permission to update this project
    if (!session.user.role.isAdmin && !hasPermission(session.user.role.permissions, "projects", "update")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const { title, description, deadline, status, environmentKeys, assignedUsers } = await req.json()

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        deadline: new Date(deadline),
        status,
        environmentKeys: environmentKeys || project.environmentKeys,
        assignedUsers: assignedUsers.map((id: string) => new mongoose.Types.ObjectId(id)),
      },
      { new: true },
    )
      .populate("assignedUsers", "name email")
      .populate("createdBy", "name email")

    // Log activity
    await logActivity(session.user.id, "update", "project", params.id, `Updated project: ${title}`)

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.role.isAdmin && !hasPermission(session.user.role.permissions, "projects", "delete")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    await dbConnect()

    const project = await Project.findById(params.id)

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Delete associated tasks
    const Task = (await import("@/lib/models/task")).Task
    await Task.deleteMany({ project: params.id })

    // Delete project
    await Project.findByIdAndDelete(params.id)

    // Log activity
    await logActivity(session.user.id, "delete", "project", params.id, `Deleted project: ${project.title}`)

    return NextResponse.json({ message: "Project deleted successfully" })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

