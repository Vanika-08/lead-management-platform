import { formatDateTime, initials } from '@/lib/utils/format';
import type { NoteDTO } from '@/types/dto';

export function NotesList({ notes }: { notes: NoteDTO[] }) {
  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground">No notes yet.</p>;
  }
  return (
    <ul className="space-y-4">
      {notes.map((note) => (
        <li key={note.id} className="flex gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {initials(note.author?.name ?? 'U')}
          </span>
          <div className="min-w-0">
            <p className="text-sm">{note.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {note.author?.name ?? 'Unknown'} · {formatDateTime(note.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
