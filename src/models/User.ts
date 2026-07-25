import { Schema, model, models, type Model, type Types } from 'mongoose';
import { USER_ROLES, type UserRole } from '@/types';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true, // one account per email; also our login lookup key
      lowercase: true,
      trim: true,
    },
    // Never selected by default so leads/users lists cannot leak hashes.
    // Login must explicitly .select('+passwordHash').
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, required: true, default: 'MEMBER' },
  },
  { timestamps: true },
);

export const User = (models.User as Model<IUser>) || model<IUser>('User', userSchema);
