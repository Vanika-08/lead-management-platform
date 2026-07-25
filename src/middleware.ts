import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth/config';

// Edge-safe instance: no providers with Node deps, token verified via AUTH_SECRET.
const { auth } = NextAuth(authConfig);

// Routes only an ADMIN may reach. MEMBER attempts are redirected to /unauthorized.
const ADMIN_PREFIXES = ['/users'];

/**
 * Coarse, first line of defence. Fine-grained checks (record ownership, status
 * transitions) live in the service/repository layers. Never the only guard.
 */
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = Boolean(req.auth);
  const role = req.auth?.user?.role;

  if (!isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  const needsAdmin = ADMIN_PREFIXES.some((p) => nextUrl.pathname.startsWith(p));
  if (needsAdmin && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', nextUrl));
  }

  return NextResponse.next();
});

// Only protected app routes run through middleware. Public routes, /login,
// /api/auth, /api/leads (public capture), and static assets are excluded.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/leads/:path*',
    '/assigned/:path*',
    '/users/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
};
