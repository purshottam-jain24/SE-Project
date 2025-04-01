import mongoose, { Schema, models } from "mongoose"

export interface IUser {
  _id?: string
  name: string
  email: string
  password: string
  role: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  },
  { timestamps: true },
)

export const User = models.User || mongoose.model<IUser>("User", userSchema)

