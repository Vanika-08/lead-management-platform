import { requireAuth } from '@/lib/auth/guards';
import { leadService } from '@/lib/services/leadService';
import { leadQuerySchema } from '@/lib/validations/lead';
import { EmptyState } from '@/components/shared/empty-state';
import { LeadsToolbar } from '@/components/features/leads/leads-toolbar';
import { LeadsTable } from '@/components/features/leads/leads-table';
import { LeadsPagination } from '@/components/features/leads/leads-pagination';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AssignedPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireAuth();
  const raw = await searchParams;
  const parsed = leadQuerySchema.safeParse(raw);
  const base = parsed.success ? parsed.data : leadQuerySchema.parse({});
  // Force self-assignment view. For MEMBER the repository already scopes to self;
  // for ADMIN this narrows the list to leads they own.
  const query = { ...base, assignedTo: user.id };

  const { data, meta } = await leadService.listLeads(
    { id: user.id, role: user.role },
    query,
  );

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Assigned to me</h1>
        <p className="text-sm text-muted-foreground">Leads currently in your queue.</p>
      </div>
      <LeadsToolbar />
      {data.length === 0 ? (
        <EmptyState title="Nothing assigned yet" description="Leads assigned to you will show here." />
      ) : (
        <>
          <LeadsTable leads={data} isAdmin={user.role === 'ADMIN'} />
          <LeadsPagination meta={meta} />
        </>
      )}
    </div>
  );
}
