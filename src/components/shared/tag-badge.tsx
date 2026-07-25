import { cn } from '@/lib/utils/cn';
import type { LeadTag } from '@/types';

const STYLES: Record<LeadTag, string> = {
  Hot: 'bg-rose-500/10 text-rose-600 ring-rose-500/20',
  Warm: 'bg-amber-500/10 text-amber-600 ring-amber-500/20',
  Cold: 'bg-sky-500/10 text-sky-600 ring-sky-500/20',
};

export function TagBadge({ tag }: { tag: LeadTag | null }) {
  if (!tag) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        STYLES[tag],
      )}
    >
      {tag}
    </span>
  );
}
