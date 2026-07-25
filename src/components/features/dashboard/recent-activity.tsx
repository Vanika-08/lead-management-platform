import Link from 'next/link';
import { formatDateTime } from '@/lib/utils/format';
import type { ActivityDTO } from '@/types/dto';

function describe(a: ActivityDTO): string {
  switch (a.type) {
    case 'LEAD_CREATED':
      return 'created a lead';
    case 'STATUS_CHANGED':
      return `moved status ${a.from} → ${a.to}`;
    case 'ASSIGNED':
      return a.to === 'unassigned' ? 'unassigned a lead' : 'assigned a lead';
    case 'NOTE_ADDED':
      return 'added a note';
    case 'LEAD_UPDATED':
      return 'updated a lead';
    case 'LEAD_DELETED':
      return 'deleted a lead';
    case 'LEAD_RESTORED':
      return 'restored a lead';
    default:
      return a.type;
  }
}

export function RecentActivity({ activities }: { activities: ActivityDTO[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent activity.</p>;
  }
  return (
    <ul className="divide-y">
      {activities.map((a) => (
        <li key={a.id} className="flex items-center justify-between gap-3 py-3 text-sm">
          <span className="min-w-0">
            <span className="font-medium">{a.actor?.name ?? 'System'}</span>{' '}
            <span className="text-muted-foreground">{describe(a)}</span>
            {a.leadId && a.leadName && (
              <>
                {' '}
                <Link href={`/leads/${a.leadId}`} className="text-primary hover:underline">
                  {a.leadName}
                </Link>
              </>
            )}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatDateTime(a.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}
