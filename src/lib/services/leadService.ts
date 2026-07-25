import 'server-only';
import { Types } from 'mongoose';
import { leadRepository } from '@/lib/repositories/leadRepository';
import { noteRepository } from '@/lib/repositories/noteRepository';
import { activityRepository } from '@/lib/repositories/activityRepository';
import { toLeadDTO, toNoteDTO, toActivityDTO } from '@/lib/mappers';
import { canTransition, type Actor } from '@/types';
import { ForbiddenError, NotFoundError, ConflictError } from '@/lib/utils/errors';
import type { LeadCaptureInput, LeadCreateInput, LeadQueryInput, LeadUpdateInput } from '@/lib/validations/lead';
import type { ILead } from '@/models/Lead';
import type { LeadDTO, NoteDTO, ActivityDTO, Paginated } from '@/types/dto';

export const leadService = {
  /** Public, unauthenticated capture. Privileged fields are forced. */
  async captureLead(input: LeadCaptureInput): Promise<{ id: string }> {
    const lead = await leadRepository.create({
      name: input.name,
      email: input.email,
      phone: input.phone || undefined,
      company: input.company || undefined,
      message: input.message || undefined,
      status: 'New',
      source: 'Website',
      tag: null,
      assignedTo: null,
      createdBy: null,
    });
    await activityRepository.log({ leadId: lead._id, actorId: null, type: 'LEAD_CREATED' });
    return { id: String(lead._id) };
  },

  /** Authenticated create. MEMBERs may only create leads assigned to themselves. */
  async createLead(actor: Actor, input: LeadCreateInput): Promise<LeadDTO> {
    const assignedTo =
      actor.role === 'MEMBER'
        ? new Types.ObjectId(actor.id)
        : input.assignedTo
          ? new Types.ObjectId(input.assignedTo)
          : null;

    const lead = await leadRepository.create({
      name: input.name,
      email: input.email,
      phone: input.phone || undefined,
      company: input.company || undefined,
      message: input.message || undefined,
      status: input.status,
      tag: input.tag,
      source: input.source,
      assignedTo,
      createdBy: new Types.ObjectId(actor.id),
      updatedBy: new Types.ObjectId(actor.id),
    });

    await activityRepository.log({
      leadId: lead._id,
      actorId: new Types.ObjectId(actor.id),
      type: 'LEAD_CREATED',
    });
    if (assignedTo) {
      await activityRepository.log({
        leadId: lead._id,
        actorId: new Types.ObjectId(actor.id),
        type: 'ASSIGNED',
        to: String(assignedTo),
      });
    }
    return toLeadDTO(lead);
  },

  async listLeads(actor: Actor, query: LeadQueryInput): Promise<Paginated<LeadDTO>> {
    const skip = (query.page - 1) * query.limit;
    const filters = {
      status: query.status,
      tag: query.tag,
      source: query.source,
      assignedTo: query.assignedTo,
      q: query.q,
    };
    const [rows, total] = await Promise.all([
      leadRepository.list(actor, { filters, sort: query.sort, skip, limit: query.limit }),
      leadRepository.count(actor, filters),
    ]);
    return {
      data: rows.map(toLeadDTO),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async getLead(actor: Actor, id: string): Promise<LeadDTO> {
    const lead = await leadRepository.findById(actor, id);
    if (!lead) throw new NotFoundError('Lead not found.');
    return toLeadDTO(lead);
  },

  async getLeadDetail(
    actor: Actor,
    id: string,
  ): Promise<{ lead: LeadDTO; notes: NoteDTO[]; activities: ActivityDTO[] }> {
    const lead = await leadRepository.findById(actor, id);
    if (!lead) throw new NotFoundError('Lead not found.');
    const [notes, activities] = await Promise.all([
      noteRepository.listByLead(id),
      activityRepository.listByLead(id),
    ]);
    return { lead: toLeadDTO(lead), notes: notes.map(toNoteDTO), activities: activities.map(toActivityDTO) };
  },

  async updateLead(actor: Actor, id: string, input: LeadUpdateInput): Promise<LeadDTO> {
    const current = await leadRepository.findById(actor, id);
    if (!current) throw new NotFoundError('Lead not found.');

    // MEMBERs may only change status. Everything else is admin-only.
    if (actor.role === 'MEMBER') {
      const attemptedKeys = Object.keys(input).filter((k) => k !== 'status');
      if (attemptedKeys.length > 0) {
        throw new ForbiddenError('Members can only update lead status.');
      }
    }

    const patch: Partial<ILead> = { updatedBy: new Types.ObjectId(actor.id) };
    const logs: Array<Parameters<typeof activityRepository.log>[0]> = [];
    const actorId = new Types.ObjectId(actor.id);

    if (input.status && input.status !== current.status) {
      if (!canTransition(current.status, input.status)) {
        throw new ConflictError(
          `Cannot move a lead from "${current.status}" to "${input.status}".`,
        );
      }
      patch.status = input.status;
      logs.push({ leadId: current._id, actorId, type: 'STATUS_CHANGED', from: current.status, to: input.status });
    }

    if (input.assignedTo !== undefined) {
      const next = input.assignedTo ? new Types.ObjectId(input.assignedTo) : null;
      patch.assignedTo = next;
      logs.push({ leadId: current._id, actorId, type: 'ASSIGNED', to: next ? String(next) : 'unassigned' });
    }

    if (input.name !== undefined) patch.name = input.name;
    if (input.phone !== undefined) patch.phone = input.phone || undefined;
    if (input.company !== undefined) patch.company = input.company || undefined;
    if (input.tag !== undefined) patch.tag = input.tag;

    const updated = await leadRepository.update(actor, id, patch);
    if (!updated) throw new NotFoundError('Lead not found.');

    if (logs.length === 0) {
      await activityRepository.log({ leadId: current._id, actorId, type: 'LEAD_UPDATED' });
    } else {
      for (const l of logs) await activityRepository.log(l);
    }
    return toLeadDTO(updated);
  },

  async addNote(actor: Actor, id: string, body: string): Promise<NoteDTO> {
    const lead = await leadRepository.findById(actor, id); // enforces visibility
    if (!lead) throw new NotFoundError('Lead not found.');
    const note = await noteRepository.create({ leadId: id, authorId: actor.id, body });
    await activityRepository.log({
      leadId: lead._id,
      actorId: new Types.ObjectId(actor.id),
      type: 'NOTE_ADDED',
    });
    return toNoteDTO(note);
  },

  /** Soft delete. ADMIN only. */
  async deleteLead(actor: Actor, id: string): Promise<void> {
    if (actor.role !== 'ADMIN') throw new ForbiddenError('Only admins can delete leads.');
    const ok = await leadRepository.softDelete(actor, id, actor.id);
    if (!ok) throw new NotFoundError('Lead not found.');
    await activityRepository.log({
      leadId: new Types.ObjectId(id),
      actorId: new Types.ObjectId(actor.id),
      type: 'LEAD_DELETED',
    });
  },
};
