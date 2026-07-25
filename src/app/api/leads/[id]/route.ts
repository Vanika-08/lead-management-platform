import { type NextRequest } from 'next/server';
import { leadUpdateSchema } from '@/lib/validations/lead';
import { leadService } from '@/lib/services/leadService';
import { requireAuth } from '@/lib/auth/guards';
import { withErrorHandler, ok } from '@/lib/api/response';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  return withErrorHandler(async () => {
    const user = await requireAuth();
    const { id } = await params;
    const dto = await leadService.getLead({ id: user.id, role: user.role }, id);
    return ok(dto);
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  return withErrorHandler(async () => {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const input = leadUpdateSchema.parse(body);
    const dto = await leadService.updateLead({ id: user.id, role: user.role }, id, input);
    return ok(dto);
  });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  return withErrorHandler(async () => {
    const user = await requireAuth();
    const { id } = await params;
    await leadService.deleteLead({ id: user.id, role: user.role }, id);
    return ok({ id }, 200);
  });
}
