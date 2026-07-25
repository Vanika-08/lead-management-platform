import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/status-badge';
import { TagBadge } from '@/components/shared/tag-badge';
import { LeadRowActions } from '@/components/features/leads/lead-row-actions';
import { formatDate } from '@/lib/utils/format';
import type { LeadDTO } from '@/types/dto';

export function LeadsTable({ leads, isAdmin }: { leads: LeadDTO[]; isAdmin: boolean }) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tag</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Created</TableHead>
            {isAdmin && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                  {lead.name}
                </Link>
                <div className="text-xs text-muted-foreground">{lead.email}</div>
              </TableCell>
              <TableCell className="text-sm">{lead.company ?? '—'}</TableCell>
              <TableCell>
                <StatusBadge status={lead.status} />
              </TableCell>
              <TableCell>
                <TagBadge tag={lead.tag} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{lead.source}</TableCell>
              <TableCell className="text-sm">{lead.assignee?.name ?? 'Unassigned'}</TableCell>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {formatDate(lead.createdAt)}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <LeadRowActions id={lead.id} name={lead.name} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
