/**
 * Single source of truth for domain enums and rules.
 * Imported by Mongoose models, Zod schemas, and services so there is zero drift.
 */

export const USER_ROLES = ['ADMIN', 'MEMBER'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Won',
  'Lost',
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** Mutually exclusive temperature, hence a single nullable value (not an array). */
export const LEAD_TAGS = ['Hot', 'Warm', 'Cold'] as const;
export type LeadTag = (typeof LEAD_TAGS)[number];

export const LEAD_SOURCES = ['Website', 'Referral', 'Manual', 'Import', 'Other'] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const ACTIVITY_TYPES = [
  'LEAD_CREATED',
  'LEAD_UPDATED',
  'STATUS_CHANGED',
  'ASSIGNED',
  'NOTE_ADDED',
  'LEAD_DELETED',
  'LEAD_RESTORED',
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/**
 * Allowed lead status transitions. Enforced in the service layer (M4).
 * Won and Lost are terminal states.
 */
export const STATUS_TRANSITIONS: Record<LeadStatus, readonly LeadStatus[]> = {
  New: ['Contacted', 'Lost'],
  Contacted: ['Qualified', 'Lost'],
  Qualified: ['Proposal Sent', 'Lost'],
  'Proposal Sent': ['Won', 'Lost'],
  Won: [],
  Lost: [],
} as const;

export function canTransition(from: LeadStatus, to: LeadStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}

/** Minimal identity used for repository-level authorization scoping. */
export interface Actor {
  id: string;
  role: UserRole;
}
