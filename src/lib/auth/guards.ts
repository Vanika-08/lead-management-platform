import 'server-only';
import { auth } from '@/auth';
import { ForbiddenError, UnauthorizedError } from '@/lib/utils/errors';
import type { UserRole } from '@/types';

export interface SessionUser {
  id: string;
  role: UserRole;
  name?: string | null;
  email?: string | null;
}

/** Non-throwing accessor for the current user (null if signed out). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  return (session?.user as SessionUser | undefined) ?? null;
}

/** Throws UnauthorizedError if not signed in. Use in API routes / actions. */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError('Authentication required.');
  return user;
}

/** Throws ForbiddenError if the user is not an ADMIN. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') throw new ForbiddenError('Admin access required.');
  return user;
}
