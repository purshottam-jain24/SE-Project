import mongoose, { Schema, models } from "mongoose"

export interface IProject {
  _id?: string
  title: string
  description: string
  deadline: Date
  status: "not-started" | "in-progress" | "completed"
  environmentKeys: string // HTML content for environment keys
  assignedUsers: mongoose.Types.ObjectId[]
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed"],
      default: "not-started",
    },
    environmentKeys: {
      type: String,
      default: "",
    },
    assignedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
)

export const Project = models.Project || mongoose.model<IProject>("Project", projectSchema)

