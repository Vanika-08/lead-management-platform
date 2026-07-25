import { dashboardService } from '@/lib/services/dashboardService';
import { requireAuth } from '@/lib/auth/guards';
import { withErrorHandler, ok } from '@/lib/api/response';

export async function GET() {
  return withErrorHandler(async () => {
    const user = await requireAuth();
    const stats = await dashboardService.getStats({ id: user.id, role: user.role });
    return ok(stats);
  });
}
