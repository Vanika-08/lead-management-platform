import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Building2 } from 'lucide-react';
import { requireAuth } from '@/lib/auth/guards';
import { leadService } from '@/lib/services/leadService';
import { userService } from '@/lib/services/userService';
import { NotFoundError } from '@/lib/utils/errors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { TagBadge } from '@/components/shared/tag-badge';
import { StatusChanger } from '@/components/features/leads/status-changer';
import { AssigneePicker } from '@/components/features/leads/assignee-picker';
import { ActivityTimeline } from '@/components/features/leads/activity-timeline';
import { NotesList } from '@/components/features/notes/notes-list';
import { AddNoteForm } from '@/components/features/notes/add-note-form';
import { formatDate } from '@/lib/utils/format';

type Ctx = { params: Promise<{ id: string }> };

export default async function LeadDetailPage({ params }: Ctx) {
  const user = await requireAuth();
  const { id } = await params;
  const actor = { id: user.id, role: user.role };
  const isAdmin = user.role === 'ADMIN';

  let detail;
  try {
    detail = await leadService.getLeadDetail(actor, id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  const { lead, notes, activities } = detail;
  const users = isAdmin ? await userService.listUsers() : [];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to leads
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold">{lead.name}</h1>
            <StatusBadge status={lead.status} />
            <TagBadge tag={lead.tag} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-4" /> {lead.email}
            </span>
            {lead.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-4" /> {lead.phone}
              </span>
            )}
            {lead.company && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="size-4" /> {lead.company}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <StatusChanger id={lead.id} current={lead.status} />
          {isAdmin && (
            <AssigneePicker id={lead.id} currentUserId={lead.assignee?.id ?? null} users={users} />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <Field label="Source" value={lead.source} />
              <Field label="Assignee" value={lead.assignee?.name ?? 'Unassigned'} />
              <Field label="Created" value={formatDate(lead.createdAt)} />
              <Field label="Last updated" value={formatDate(lead.updatedAt)} />
              {lead.message && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">Message</p>
                  <p className="mt-1 whitespace-pre-wrap">{lead.message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <AddNoteForm id={lead.id} />
              <NotesList notes={notes} />
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline activities={activities} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5">{value}</p>
    </div>
  );
}
