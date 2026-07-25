import { type NextRequest } from 'next/server';
import { noteCreateSchema } from '@/lib/validations/note';
import { leadService } from '@/lib/services/leadService';
import { requireAuth } from '@/lib/auth/guards';
import { withErrorHandler, ok } from '@/lib/api/response';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  return withErrorHandler(async () => {
    const user = await requireAuth();
    const { id } = await params;
    const { body } = noteCreateSchema.parse(await req.json().catch(() => ({})));
    const dto = await leadService.addNote({ id: user.id, role: user.role }, id, body);
    return ok(dto, 201);
  });
}
