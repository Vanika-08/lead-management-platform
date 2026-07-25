import { type NextRequest } from 'next/server';
import { userUpdateSchema } from '@/lib/validations/user';
import { userService } from '@/lib/services/userService';
import { requireAdmin } from '@/lib/auth/guards';
import { withErrorHandler, ok } from '@/lib/api/response';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  return withErrorHandler(async () => {
    await requireAdmin();
    const { id } = await params;
    const input = userUpdateSchema.parse(await req.json().catch(() => ({})));
    const user = await userService.updateUser(id, input);
    return ok(user);
  });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  return withErrorHandler(async () => {
    const admin = await requireAdmin();
    const { id } = await params;
    await userService.deleteUser(admin.id, id);
    return ok({ id });
  });
}
