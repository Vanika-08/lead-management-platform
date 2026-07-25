import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '@/lib/auth/config';
import { loginSchema } from '@/lib/validations/auth';
import { userService } from '@/lib/services/userService';

/**
 * Full Auth.js instance (Node runtime). Adds the Credentials provider that
 * verifies email/password against MongoDB via the service layer.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await userService.verifyCredentials(
          parsed.data.email,
          parsed.data.password,
        );
        if (!user) return null;

        // Shape becomes the `user` arg of the jwt callback.
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
});
