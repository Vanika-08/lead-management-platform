import { z } from 'zod';
import { USER_ROLES } from '@/types';

export const userCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(USER_ROLES).default('MEMBER'),
});
export type UserCreateInput = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    role: z.enum(USER_ROLES),
    password: z.string().min(8),
  })
  .partial();
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

/** Self-service profile edit. Empty password means "leave unchanged". */
export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.').max(120),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .optional()
    .or(z.literal('')),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
