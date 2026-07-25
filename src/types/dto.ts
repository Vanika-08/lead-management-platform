import type { LeadStatus, LeadTag, LeadSource, ActivityType, UserRole } from '@/types';

/** Serializable shapes crossing the server -> client boundary (no ObjectId/Date). */

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AssigneeDTO {
  id: string;
  name: string;
}

export interface LeadDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  status: LeadStatus;
  tag: LeadTag | null;
  source: LeadSource;
  assignee: AssigneeDTO | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteDTO {
  id: string;
  body: string;
  author: AssigneeDTO | null;
  createdAt: string;
}

export interface ActivityDTO {
  id: string;
  type: ActivityType;
  from?: string;
  to?: string;
  actor: AssigneeDTO | null;
  createdAt: string;
  leadId?: string;
  leadName?: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface StatusCount {
  status: LeadStatus;
  count: number;
}

export interface TrendPoint {
  month: string; // e.g. "Feb 2026"
  count: number;
}

export interface DashboardStatsDTO {
  total: number;
  today: number;
  thisWeek: number;
  won: number;
  lost: number;
  conversionRate: number; // percent, one decimal
  byStatus: StatusCount[];
  trend: TrendPoint[];
}
