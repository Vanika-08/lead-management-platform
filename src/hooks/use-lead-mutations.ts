'use client';

import { useMutation } from '@tanstack/react-query';
import type { LeadDTO, NoteDTO } from '@/types/dto';
import type { LeadCreateInput, LeadUpdateInput } from '@/lib/validations/lead';

async function request<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.error?.message ?? 'Request failed. Please try again.');
  }
  return json as T;
}

export function useUpdateLead(id: string) {
  return useMutation({
    mutationFn: (input: LeadUpdateInput) =>
      request<{ data: LeadDTO }>(`/api/leads/${id}`, 'PUT', input),
  });
}

export function useDeleteLead() {
  return useMutation({
    mutationFn: (id: string) => request<{ data: { id: string } }>(`/api/leads/${id}`, 'DELETE'),
  });
}

export function useAddNote(id: string) {
  return useMutation({
    mutationFn: (body: string) =>
      request<{ data: NoteDTO }>(`/api/leads/${id}/notes`, 'POST', { body }),
  });
}

export function useCreateLead() {
  return useMutation({
    mutationFn: (input: LeadCreateInput) =>
      request<{ data: LeadDTO }>('/api/leads', 'POST', input),
  });
}
