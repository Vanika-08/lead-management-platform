import 'server-only';
import { Types, type FilterQuery, type PipelineStage } from 'mongoose';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Lead, type ILead } from '@/models/Lead';
import type { Actor, LeadStatus } from '@/types';

/** Same scoping contract as leadRepository: soft-deleted excluded, MEMBER self-only. */
function match(actor: Actor, extra: FilterQuery<ILead> = {}): FilterQuery<ILead> {
  const base: FilterQuery<ILead> = { deletedAt: null, ...extra };
  if (actor.role === 'MEMBER') base.assignedTo = new Types.ObjectId(actor.id);
  return base;
}

export const dashboardRepository = {
  async count(actor: Actor, extra: FilterQuery<ILead> = {}): Promise<number> {
    await connectToDatabase();
    return Lead.countDocuments(match(actor, extra));
  },

  async statusCounts(actor: Actor): Promise<Array<{ status: LeadStatus; count: number }>> {
    await connectToDatabase();
    const pipeline: PipelineStage[] = [
      { $match: match(actor) },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ];
    const rows = await Lead.aggregate<{ _id: LeadStatus; count: number }>(pipeline);
    return rows.map((r) => ({ status: r._id, count: r.count }));
  },

  async monthlyTrend(
    actor: Actor,
    since: Date,
  ): Promise<Array<{ year: number; month: number; count: number }>> {
    await connectToDatabase();
    const pipeline: PipelineStage[] = [
      { $match: match(actor, { createdAt: { $gte: since } }) },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ];
    const rows = await Lead.aggregate<{ _id: { year: number; month: number }; count: number }>(
      pipeline,
    );
    return rows.map((r) => ({ year: r._id.year, month: r._id.month, count: r.count }));
  },
};
