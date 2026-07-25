import { formatDateTime } from '@/lib/utils/format';
import type { ActivityDTO } from '@/types/dto';

function describe(a: ActivityDTO): string {
  switch (a.type) {
    case 'LEAD_CREATED':
      return 'Lead created';
    case 'STATUS_CHANGED':
      return `Status changed from ${a.from} to ${a.to}`;
    case 'ASSIGNED':
      return a.to === 'unassigned' ? 'Lead unassigned' : 'Lead assigned';
    case 'NOTE_ADDED':
      return 'Note added';
    case 'LEAD_UPDATED':
      return 'Lead details updated';
    case 'LEAD_DELETED':
      return 'Lead deleted';
    case 'LEAD_RESTORED':
      return 'Lead restored';
    default:
      return a.type;
  }
}

export function ActivityTimeline({ activities }: { activities: ActivityDTO[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }
  return (
    <ol className="relative space-y-4 border-l pl-5">
      {activities.map((a) => (
        <li key={a.id} className="relative">
          <span className="absolute -left-[23px] top-1.5 size-2.5 rounded-full bg-primary" />
          <p className="text-sm">{describe(a)}</p>
          <p className="text-xs text-muted-foreground">
            {a.actor?.name ? `${a.actor.name} · ` : ''}
            {formatDateTime(a.createdAt)}
          </p>
        </li>
      ))}
    </ol>
  );
}
