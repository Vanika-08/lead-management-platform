import { Schema, model, models, type Model, type Types } from 'mongoose';

export interface INote {
  _id: Types.ObjectId;
  leadId: Types.ObjectId;
  authorId: Types.ObjectId;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

// Notes are paginated per lead, newest first.
noteSchema.index({ leadId: 1, createdAt: -1 });

export const Note = (models.Note as Model<INote>) || model<INote>('Note', noteSchema);
