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
import type { UserDTO } from '@/types/dto';

const UNASSIGNED = 'unassigned';

export function AssigneePicker({
  id,
  currentUserId,
  users,
}: {
  id: string;
  currentUserId: string | null;
  users: UserDTO[];
}) {
  const router = useRouter();
  const { mutate, isPending } = useUpdateLead(id);

  function onChange(value: string) {
    const assignedTo = value === UNASSIGNED ? null : value;
    mutate(
      { assignedTo },
      {
        onSuccess: () => {
          toast.success('Assignment updated.');
          router.refresh();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">Assignee</label>
      <Select value={currentUserId ?? UNASSIGNED} onValueChange={onChange} disabled={isPending}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Unassigned" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
          {users.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
