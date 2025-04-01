import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "@/lib/db"
import { Task } from "@/lib/models/task"
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
    const projectId = searchParams.get("projectId")
    const userId = searchParams.get("userId")

    let query = {}

    // Filter by project if projectId is provided
    if (projectId) {
      query = { ...query, project: new mongoose.Types.ObjectId(projectId) }
    }

    // If user is not admin, only show tasks assigned to them
    if (!session.user.role.isAdmin) {
      query = { ...query, assignedTo: new mongoose.Types.ObjectId(session.user.id) }
    }
    // If userId is provided and user is admin, filter by that userId
    else if (userId) {
      query = { ...query, assignedTo: new mongoose.Types.ObjectId(userId) }
    }

    const tasks = await Task.find(query)
      .populate("project", "title")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.role.isAdmin && !hasPermission(session.user.role.permissions, "tasks", "create")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const { title, description, projectId, assignedToId, status } = await req.json()

    // Validate input
    if (!title || !description || !projectId || !assignedToId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    // Check if project exists and user has access
    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const task = await Task.create({
      title,
      description,
      status: status || "not-started",
      project: new mongoose.Types.ObjectId(projectId),
      assignedTo: new mongoose.Types.ObjectId(assignedToId),
      createdBy: new mongoose.Types.ObjectId(session.user.id),
    })

    // Log activity
    await logActivity(
      session.user.id,
      "create",
      "task",
      task._id.toString(),
      `Created task: ${title} for project: ${project.title}`,
    )

    const populatedTask = await Task.findById(task._id)
      .populate("project", "title")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")

    return NextResponse.json(populatedTask, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

