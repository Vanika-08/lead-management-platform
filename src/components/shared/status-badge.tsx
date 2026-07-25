import { cn } from '@/lib/utils/cn';
import type { LeadStatus } from '@/types';

const STYLES: Record<LeadStatus, string> = {
  New: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Contacted: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Qualified: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'Proposal Sent': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  Won: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Lost: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STYLES[status],
      )}
    >
      {status}
    </span>
  );
}
