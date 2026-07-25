'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAddNote } from '@/hooks/use-lead-mutations';

export function AddNoteForm({ id }: { id: string }) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const { mutate, isPending } = useAddNote(id);

  function submit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    mutate(trimmed, {
      onSuccess: () => {
        setBody('');
        toast.success('Note added.');
        router.refresh();
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a note about this lead..."
        maxLength={2000}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={submit} disabled={isPending || body.trim().length === 0}>
          {isPending ? 'Adding' : 'Add note'}
        </Button>
      </div>
    </div>
  );
}
