import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import dbConnect from "@/lib/db"
import { User } from "@/lib/models/user"
import { Role } from "@/lib/models/role"
import { logActivity } from "@/lib/activity-logger"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Get default role (non-admin)
    let defaultRole = await Role.findOne({ name: "User" })

    // If no default role exists, create it
    if (!defaultRole) {
      defaultRole = await Role.create({
        name: "User",
        description: "Regular user with limited permissions",
        permissions: [
          {
            resource: "projects",
            actions: ["read"],
          },
          {
            resource: "tasks",
            actions: ["read", "update"],
          },
        ],
        isAdmin: false,
      })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: defaultRole._id,
    })

    // Log activity
    await logActivity(user._id.toString(), "create", "user", user._id.toString(), "User registration")

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject()

    return NextResponse.json({ message: "User created successfully", user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

