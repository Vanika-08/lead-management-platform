import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireAuth } from '@/lib/auth/guards';
import { leadService } from '@/lib/services/leadService';
import { leadQuerySchema } from '@/lib/validations/lead';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { LeadsToolbar } from '@/components/features/leads/leads-toolbar';
import { LeadsTable } from '@/components/features/leads/leads-table';
import { LeadsPagination } from '@/components/features/leads/leads-pagination';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireAuth();
  const raw = await searchParams;
  const parsed = leadQuerySchema.safeParse(raw);
  const query = parsed.success ? parsed.data : leadQuerySchema.parse({});

  const { data, meta } = await leadService.listLeads(
    { id: user.id, role: user.role },
    query,
  );
  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Leads</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'All leads across the team.' : 'Leads assigned to you.'}
          </p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/leads/new">
              <Plus aria-hidden /> New lead
            </Link>
          </Button>
        )}
      </div>

      <LeadsToolbar />

      {data.length === 0 ? (
        <EmptyState
          title="No leads found"
          description="Try clearing filters, or wait for new inbound leads to arrive."
        />
      ) : (
        <>
          <LeadsTable leads={data} isAdmin={isAdmin} />
          <LeadsPagination meta={meta} />
        </>
      )}
    </div>
  );
}
