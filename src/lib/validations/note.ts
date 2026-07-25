import { z } from 'zod';

export const noteCreateSchema = z.object({
  body: z.string().trim().min(1, 'Note cannot be empty.').max(2000),
});
export type NoteCreateInput = z.infer<typeof noteCreateSchema>;
