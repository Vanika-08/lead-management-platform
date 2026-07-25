import 'server-only';
import bcrypt from 'bcryptjs';
import { userRepository, listAllUsers } from '@/lib/repositories/userRepository';
import { toUserDTO } from '@/lib/mappers';
import { ConflictError, ForbiddenError, NotFoundError } from '@/lib/utils/errors';
import type { UserRole } from '@/types';
import type { UserDTO } from '@/types/dto';
import type { UserCreateInput, UserUpdateInput } from '@/lib/validations/user';

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
const BCRYPT_COST = 12;

export const userService = {
  async verifyCredentials(email: string, password: string): Promise<SafeUser | null> {
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      return null;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;
    return { id: String(user._id), email: user.email, name: user.name, role: user.role };
  },

  async listUsers(): Promise<UserDTO[]> {
    const users = await listAllUsers();
    return users.map(toUserDTO);
  },

  async getUser(id: string): Promise<UserDTO> {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User not found.');
    return toUserDTO(user);
  },

  async createUser(input: UserCreateInput): Promise<UserDTO> {
    if (await userRepository.emailExists(input.email)) {
      throw new ConflictError('A user with that email already exists.');
    }
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });
    return toUserDTO(user);
  },

  async updateUser(id: string, input: UserUpdateInput): Promise<UserDTO> {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User not found.');

    // Guard against removing the last admin from the system.
    if (input.role && input.role !== user.role && user.role === 'ADMIN' && input.role === 'MEMBER') {
      const admins = await userRepository.countByRole('ADMIN');
      if (admins <= 1) throw new ConflictError('Cannot demote the last remaining admin.');
    }

    const patch: Record<string, unknown> = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.role !== undefined) patch.role = input.role;
    if (input.password) patch.passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

    const updated = await userRepository.update(id, patch);
    if (!updated) throw new NotFoundError('User not found.');
    return toUserDTO(updated);
  },

  async deleteUser(actorId: string, id: string): Promise<void> {
    if (actorId === id) throw new ForbiddenError('You cannot delete your own account.');
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User not found.');
    if (user.role === 'ADMIN') {
      const admins = await userRepository.countByRole('ADMIN');
      if (admins <= 1) throw new ConflictError('Cannot delete the last remaining admin.');
    }
    await userRepository.deleteById(id);
  },

  /** Self-service profile update: name and/or password only. */
  async updateProfile(id: string, input: { name?: string; password?: string }): Promise<UserDTO> {
    const patch: Record<string, unknown> = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.password) patch.passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
    const updated = await userRepository.update(id, patch);
    if (!updated) throw new NotFoundError('User not found.');
    return toUserDTO(updated);
  },
};
