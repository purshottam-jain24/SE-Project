import mongoose, { Schema, models } from "mongoose"

export interface Permission {
  resource: string
  actions: string[]
}

export interface IRole {
  _id?: string
  name: string
  description: string
  permissions: Permission[]
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date
}

const permissionSchema = new Schema<Permission>({
  resource: {
    type: String,
    required: true,
  },
  actions: {
    type: [String],
    required: true,
  },
})

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Role description is required"],
    },
    permissions: [permissionSchema],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export const Role = models.Role || mongoose.model<IRole>("Role", roleSchema)

