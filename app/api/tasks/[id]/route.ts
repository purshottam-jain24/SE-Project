import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "@/lib/db"
import { Task } from "@/lib/models/task"
import { authOptions } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { logActivity } from "@/lib/activity-logger"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const task = await Task.findById(params.id)
      .populate("project", "title")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user has access to this task
    if (!session.user.role.isAdmin && task.assignedTo._id.toString() !== session.user.id) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const task = await Task.findById(params.id)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user has access to update this task
    if (
      !session.user.role.isAdmin &&
      task.assignedTo.toString() !== session.user.id &&
      !hasPermission(session.user.role.permissions, "tasks", "update")
    ) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const { status } = await req.json()

    // Update task status
    const updatedTask = await Task.findByIdAndUpdate(params.id, { status }, { new: true })
      .populate("project", "title")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")

    // Log activity
    await logActivity(session.user.id, "update", "task", params.id, `Updated task status to: ${status}`)

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.role.isAdmin && !hasPermission(session.user.role.permissions, "tasks", "update")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    await dbConnect()

    const task = await Task.findById(params.id)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const { title, description, status, assignedToId } = await req.json()

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        status,
        assignedTo: assignedToId,
      },
      { new: true },
    )
      .populate("project", "title")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")

    // Log activity
    await logActivity(session.user.id, "update", "task", params.id, `Updated task: ${title}`)

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.role.isAdmin && !hasPermission(session.user.role.permissions, "tasks", "delete")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    await dbConnect()

    const task = await Task.findById(params.id)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    await Task.findByIdAndDelete(params.id)

    // Log activity
    await logActivity(session.user.id, "delete", "task", params.id, `Deleted task: ${task.title}`)

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

