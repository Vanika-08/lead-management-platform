import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@/types';

/**
 * Edge-safe auth config shared by middleware and the full server instance.
 * Contains NO database or bcrypt code so it can run in the Edge runtime.
 * The Credentials provider (Node-only) is attached in src/auth.ts.
 *
 * Credentials-based auth requires the JWT session strategy; the DB-session
 * adapter is incompatible with it. "Session-based" here means an encrypted
 * JWT-backed session cookie managed by Auth.js.
 */
export const authConfig = {
  session: { strategy: 'jwt' },
  trustHost: true, // required off-Vercel (Netlify)
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    // Runs at sign-in (user present) and on every request. Persist id + role.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },
    // Surface id + role to Server Components / middleware without a DB round trip.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
