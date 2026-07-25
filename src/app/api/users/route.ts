import { type NextRequest } from 'next/server';
import { userCreateSchema } from '@/lib/validations/user';
import { userService } from '@/lib/services/userService';
import { requireAdmin } from '@/lib/auth/guards';
import { withErrorHandler, ok } from '@/lib/api/response';

export async function GET() {
  return withErrorHandler(async () => {
    await requireAdmin();
    const users = await userService.listUsers();
    return ok(users);
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    await requireAdmin();
    const input = userCreateSchema.parse(await req.json().catch(() => ({})));
    const user = await userService.createUser(input);
    return ok(user, 201);
  });
}
