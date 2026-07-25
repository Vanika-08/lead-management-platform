import 'server-only';
import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Note, type INote } from '@/models/Note';

export const noteRepository = {
  async create(data: { leadId: string; authorId: string; body: string }): Promise<INote> {
    await connectToDatabase();
    const note = await Note.create({
      leadId: new Types.ObjectId(data.leadId),
      authorId: new Types.ObjectId(data.authorId),
      body: data.body,
    });
    await note.populate('authorId', 'name');
    return note.toObject<INote>();
  },

  async listByLead(leadId: string): Promise<INote[]> {
    await connectToDatabase();
    return Note.find({ leadId: new Types.ObjectId(leadId) })
      .populate('authorId', 'name')
      .sort({ createdAt: -1 })
      .lean<INote[]>();
  },
};
