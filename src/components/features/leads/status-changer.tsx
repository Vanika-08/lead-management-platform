'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateLead } from '@/hooks/use-lead-mutations';
import { LEAD_STATUSES, STATUS_TRANSITIONS, type LeadStatus } from '@/types';

export function StatusChanger({ id, current }: { id: string; current: LeadStatus }) {
  const router = useRouter();
  const { mutate, isPending } = useUpdateLead(id);
  const allowed = STATUS_TRANSITIONS[current];
  const terminal = allowed.length === 0;

  function onChange(next: string) {
    if (next === current) return;
    mutate(
      { status: next as LeadStatus },
      {
        onSuccess: () => {
          toast.success(`Status updated to ${next}.`);
          router.refresh();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">Status</label>
      <Select value={current} onValueChange={onChange} disabled={isPending || terminal}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LEAD_STATUSES.map((s) => (
            <SelectItem key={s} value={s} disabled={s !== current && !allowed.includes(s)}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {terminal && <p className="text-xs text-muted-foreground">This lead is in a final state.</p>}
    </div>
  );
}
