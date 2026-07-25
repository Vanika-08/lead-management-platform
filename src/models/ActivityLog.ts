import { Schema, model, models, type Model, type Types } from 'mongoose';
import { ACTIVITY_TYPES, type ActivityType } from '@/types';

/**
 * Append-only audit timeline. Written inside every lead mutation (M4).
 * `from`/`to` capture status transitions; `meta` holds arbitrary context
 * (e.g. assignee change) without schema churn.
 */
export interface IActivityLog {
  _id: Types.ObjectId;
  leadId: Types.ObjectId;
  actorId: Types.ObjectId | null; // null for system/public-triggered events
  type: ActivityType;
  from?: string;
  to?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    from: { type: String },
    to: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }, // immutable
);

activityLogSchema.index({ leadId: 1, createdAt: -1 });

export const ActivityLog =
  (models.ActivityLog as Model<IActivityLog>) ||
  model<IActivityLog>('ActivityLog', activityLogSchema);
