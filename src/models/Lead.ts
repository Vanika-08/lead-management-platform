import { Schema, model, models, type Model, type Types } from 'mongoose';
import {
  LEAD_STATUSES,
  LEAD_TAGS,
  LEAD_SOURCES,
  type LeadStatus,
  type LeadTag,
  type LeadSource,
} from '@/types';

export interface ILead {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  status: LeadStatus;
  tag: LeadTag | null;
  source: LeadSource;
  assignedTo: Types.ObjectId | null;
  // Audit trail. createdBy is null for public capture (no session).
  createdBy: Types.ObjectId | null;
  updatedBy: Types.ObjectId | null;
  // Soft delete. Default query scope (M4 repository) filters deletedAt: null.
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true }, // NOT unique: dedup is a business rule, not a constraint
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    message: { type: String, trim: true },
    status: { type: String, enum: LEAD_STATUSES, required: true, default: 'New' },
    tag: { type: String, enum: LEAD_TAGS, default: null },
    source: { type: String, enum: LEAD_SOURCES, required: true, default: 'Website' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

// Member-scoped list (assigned + status filter + recency sort) — the hottest query.
leadSchema.index({ assignedTo: 1, status: 1, createdAt: -1 });
// Admin list / dashboard aggregations by status over time.
leadSchema.index({ status: 1, createdAt: -1 });
// Soft-delete scoping.
leadSchema.index({ deletedAt: 1 });
// Full-text search across the fields users search by.
leadSchema.index({ name: 'text', email: 'text', company: 'text' });

export const Lead = (models.Lead as Model<ILead>) || model<ILead>('Lead', leadSchema);
