import { z } from 'zod';
import { LEAD_STATUSES, LEAD_TAGS, LEAD_SOURCES } from '@/types';

// Permissive international phone: digits, spaces, +, -, (), 7-20 chars.
const phoneRegex = /^[+]?[\d\s().-]{7,20}$/;

/** Public landing form. Source/status are server-assigned, never client-supplied. */
export const leadCaptureSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email.'),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Enter a valid phone number.')
    .optional()
    .or(z.literal('')),
  company: z.string().trim().max(160).optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
});
export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>;

/** Internal create (authenticated). Allows setting status/tag/source/assignee. */
export const leadCreateSchema = leadCaptureSchema.extend({
  status: z.enum(LEAD_STATUSES).default('New'),
  tag: z.enum(LEAD_TAGS).nullable().default(null),
  source: z.enum(LEAD_SOURCES).default('Manual'),
  assignedTo: z.string().length(24, 'Invalid user id.').nullable().optional(),
});
export type LeadCreateInput = z.infer<typeof leadCreateSchema>;

/** Partial update. Status transitions are validated in the service layer. */
export const leadUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().regex(phoneRegex).or(z.literal('')),
    company: z.string().trim().max(160).or(z.literal('')),
    status: z.enum(LEAD_STATUSES),
    tag: z.enum(LEAD_TAGS).nullable(),
    assignedTo: z.string().length(24).nullable(),
  })
  .partial();
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;

/** List query params. Coerces strings from the URL into typed values. */
export const leadQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(120).optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  tag: z.enum(LEAD_TAGS).optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  assignedTo: z.string().length(24).optional(),
  sort: z.enum(['createdAt', '-createdAt', 'updatedAt', '-updatedAt']).default('-createdAt'),
});
export type LeadQueryInput = z.infer<typeof leadQuerySchema>;
