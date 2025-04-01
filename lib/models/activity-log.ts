import mongoose, { Schema, models } from "mongoose"

export interface IActivityLog {
  _id?: string
  user: mongoose.Types.ObjectId
  action: string
  resource: string
  resourceId: mongoose.Types.ObjectId
  details: string
  timestamp: Date
}

const activityLogSchema = new Schema<IActivityLog>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  resource: {
    type: String,
    required: true,
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  details: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export const ActivityLog = models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", activityLogSchema)

