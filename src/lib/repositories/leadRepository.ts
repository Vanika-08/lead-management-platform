import 'server-only';
import { Types, type FilterQuery, type SortOrder } from 'mongoose';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Lead, type ILead } from '@/models/Lead';
import type { Actor } from '@/types';

/**
 * The single data-access point for leads. Every method takes an `actor` and
 * merges an authorization scope that CANNOT be omitted by callers:
 *   - deletedAt: null   -> soft-deleted rows are never returned/updated
 *   - assignedTo: self  -> MEMBERs only ever touch their own leads
 * Even if middleware and service guards were bypassed, a MEMBER query resolves
 * to nothing outside their assignments. This is the real enforcement layer.
 */
function scope(actor: Actor): FilterQuery<ILead> {
  const base: FilterQuery<ILead> = { deletedAt: null };
  if (actor.role === 'MEMBER') base.assignedTo = new Types.ObjectId(actor.id);
  return base;
}

export interface LeadFilters {
  status?: string;
  tag?: string;
  source?: string;
  assignedTo?: string; // ignored for MEMBER (forced to self by scope)
  q?: string;
}

export interface ListOptions {
  filters: LeadFilters;
  sort: string; // e.g. '-createdAt'
  skip: number;
  limit: number;
}

function buildFilter(actor: Actor, filters: LeadFilters): FilterQuery<ILead> {
  const f: FilterQuery<ILead> = { ...scope(actor) };
  if (filters.status) f.status = filters.status;
  if (filters.tag) f.tag = filters.tag;
  if (filters.source) f.source = filters.source;
  // Only ADMIN may filter by an arbitrary assignee; MEMBER stays self-scoped.
  if (actor.role === 'ADMIN' && filters.assignedTo) {
    f.assignedTo = new Types.ObjectId(filters.assignedTo);
  }
  if (filters.q) {
    const rx = new RegExp(filters.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    f.$or = [{ name: rx }, { email: rx }, { company: rx }];
  }
  return f;
}

function parseSort(sort: string): Record<string, SortOrder> {
  const desc = sort.startsWith('-');
  const key = desc ? sort.slice(1) : sort;
  return { [key]: desc ? -1 : 1 };
}

export const leadRepository = {
  async create(data: Partial<ILead>): Promise<ILead> {
    await connectToDatabase();
    const lead = await Lead.create(data);
    return lead.toObject<ILead>();
  },

  async list(actor: Actor, opts: ListOptions): Promise<ILead[]> {
    await connectToDatabase();
    return Lead.find(buildFilter(actor, opts.filters))
      .populate('assignedTo', 'name')
      .sort(parseSort(opts.sort))
      .skip(opts.skip)
      .limit(opts.limit)
      .lean<ILead[]>();
  },

  async count(actor: Actor, filters: LeadFilters): Promise<number> {
    await connectToDatabase();
    return Lead.countDocuments(buildFilter(actor, filters));
  },

  async findById(actor: Actor, id: string): Promise<ILead | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return Lead.findOne({ _id: id, ...scope(actor) })
      .populate('assignedTo', 'name')
      .lean<ILead | null>();
  },

  async update(actor: Actor, id: string, patch: Partial<ILead>): Promise<ILead | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return Lead.findOneAndUpdate({ _id: id, ...scope(actor) }, patch, { new: true })
      .populate('assignedTo', 'name')
      .lean<ILead | null>();
  },

  async softDelete(actor: Actor, id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    await connectToDatabase();
    const res = await Lead.updateOne(
      { _id: id, ...scope(actor) },
      { deletedAt: new Date(), deletedBy: new Types.ObjectId(deletedBy) },
    );
    return res.modifiedCount === 1;
  },
};
