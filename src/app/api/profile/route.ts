import { type NextRequest } from 'next/server';
import { profileUpdateSchema } from '@/lib/validations/user';
import { userService } from '@/lib/services/userService';
import { requireAuth } from '@/lib/auth/guards';
import { withErrorHandler, ok } from '@/lib/api/response';

export async function PUT(req: NextRequest) {
  return withErrorHandler(async () => {
    const user = await requireAuth();
    const input = profileUpdateSchema.parse(await req.json().catch(() => ({})));
    const updated = await userService.updateProfile(user.id, {
      name: input.name,
      password: input.password || undefined,
    });
    return ok(updated);
  });
}
