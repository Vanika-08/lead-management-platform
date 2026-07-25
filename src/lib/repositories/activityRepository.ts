import 'server-only';
import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db/mongoose';
import { ActivityLog, type IActivityLog } from '@/models/ActivityLog';
import { Lead } from '@/models/Lead';
import type { Actor } from '@/types';

type LogInput = Pick<IActivityLog, 'leadId' | 'actorId' | 'type'> &
  Partial<Pick<IActivityLog, 'from' | 'to' | 'meta'>>;

export const activityRepository = {
  async log(entry: LogInput): Promise<void> {
    await connectToDatabase();
    await ActivityLog.create(entry);
  },

  async listByLead(leadId: string): Promise<IActivityLog[]> {
    await connectToDatabase();
    return ActivityLog.find({ leadId: new Types.ObjectId(leadId) })
      .populate('actorId', 'name')
      .sort({ createdAt: -1 })
      .lean<IActivityLog[]>();
  },

  /** Recent activity across leads the actor may see (ADMIN: all; MEMBER: own). */
  async listRecent(actor: Actor, limit: number): Promise<IActivityLog[]> {
    await connectToDatabase();
    const filter: Record<string, unknown> = {};
    if (actor.role === 'MEMBER') {
      const leadIds = await Lead.find({
        assignedTo: new Types.ObjectId(actor.id),
        deletedAt: null,
      }).distinct('_id');
      filter.leadId = { $in: leadIds };
    }
    return ActivityLog.find(filter)
      .populate('actorId', 'name')
      .populate('leadId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<IActivityLog[]>();
  },
};
