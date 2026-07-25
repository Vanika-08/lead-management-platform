import 'server-only';
import type { ILead } from '@/models/Lead';
import type { INote } from '@/models/Note';
import type { IActivityLog } from '@/models/ActivityLog';
import type { IUser } from '@/models/User';
import type { LeadDTO, NoteDTO, ActivityDTO, UserDTO, AssigneeDTO } from '@/types/dto';

type Ref = { _id: unknown; name?: string } | null | undefined | unknown;

function toAssignee(ref: Ref): AssigneeDTO | null {
  if (ref && typeof ref === 'object' && 'name' in ref && '_id' in ref) {
    const r = ref as { _id: unknown; name: string };
    return { id: String(r._id), name: r.name };
  }
  return null;
}

export function toLeadDTO(lead: ILead): LeadDTO {
  return {
    id: String(lead._id),
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    message: lead.message,
    status: lead.status,
    tag: lead.tag,
    source: lead.source,
    assignee: toAssignee(lead.assignedTo),
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export function toNoteDTO(note: INote): NoteDTO {
  return {
    id: String(note._id),
    body: note.body,
    author: toAssignee(note.authorId),
    createdAt: note.createdAt.toISOString(),
  };
}

export function toActivityDTO(a: IActivityLog): ActivityDTO {
  const leadRef = a.leadId as unknown;
  let leadId: string | undefined;
  let leadName: string | undefined;
  if (leadRef && typeof leadRef === 'object' && 'name' in leadRef && '_id' in leadRef) {
    const r = leadRef as { _id: unknown; name: string };
    leadId = String(r._id);
    leadName = r.name;
  } else if (leadRef) {
    leadId = String(leadRef);
  }
  return {
    id: String(a._id),
    type: a.type,
    from: a.from,
    to: a.to,
    actor: toAssignee(a.actorId),
    createdAt: a.createdAt.toISOString(),
    leadId,
    leadName,
  };
}

export function toUserDTO(u: IUser): UserDTO {
  return { id: String(u._id), name: u.name, email: u.email, role: u.role };
}
