import { NextResponse, type NextRequest } from 'next/server';
import { leadCaptureSchema, leadCreateSchema, leadQuerySchema } from '@/lib/validations/lead';
import { leadService } from '@/lib/services/leadService';
import { getCurrentUser, requireAuth } from '@/lib/auth/guards';
import { withErrorHandler, ok } from '@/lib/api/response';

/** GET /api/leads — authenticated, scoped list with pagination/filter/search/sort. */
export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const user = await requireAuth();
    const params = Object.fromEntries(new URL(req.url).searchParams);
    const query = leadQuerySchema.parse(params);
    const result = await leadService.listLeads({ id: user.id, role: user.role }, query);
    return NextResponse.json(result);
  });
}

/**
 * POST /api/leads
 *  - unauthenticated -> public capture (leadCaptureSchema, fields forced)
 *  - authenticated   -> internal create (leadCreateSchema, MEMBER assigned to self)
 */
export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    const json = await req.json().catch(() => ({}));

    if (!user) {
      const data = leadCaptureSchema.parse(json);
      const created = await leadService.captureLead(data);
      return ok(created, 201);
    }

    const data = leadCreateSchema.parse(json);
    const dto = await leadService.createLead({ id: user.id, role: user.role }, data);
    return ok(dto, 201);
  });
}
