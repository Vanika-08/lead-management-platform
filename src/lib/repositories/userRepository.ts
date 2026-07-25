import 'server-only';
import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User, type IUser } from '@/models/User';
import type { UserRole } from '@/types';

export const userRepository = {
  /** Includes the normally-hidden passwordHash for credential verification only. */
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    await connectToDatabase();
    return User.findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .lean<IUser | null>();
  },

  async findById(id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return User.findById(id).lean<IUser | null>();
  },

  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    await connectToDatabase();
    const query: Record<string, unknown> = { email: email.toLowerCase() };
    if (excludeId) query._id = { $ne: new Types.ObjectId(excludeId) };
    return (await User.countDocuments(query)) > 0;
  },

  async countByRole(role: UserRole): Promise<number> {
    await connectToDatabase();
    return User.countDocuments({ role });
  },

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }): Promise<IUser> {
    await connectToDatabase();
    const user = await User.create(data);
    return user.toObject<IUser>();
  },

  async update(id: string, patch: Partial<IUser>): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return User.findByIdAndUpdate(id, patch, { new: true }).lean<IUser | null>();
  },

  async deleteById(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    await connectToDatabase();
    const res = await User.deleteOne({ _id: id });
    return res.deletedCount === 1;
  },
};

export async function listAllUsers(): Promise<IUser[]> {
  await connectToDatabase();
  return User.find().select('name email role').sort({ name: 1 }).lean<IUser[]>();
}
