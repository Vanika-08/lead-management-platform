'use client';

import { useMutation } from '@tanstack/react-query';
import type { LeadCaptureInput } from '@/lib/validations/lead';

interface CreateLeadResponse {
  data: { id: string };
}

async function postLead(input: LeadCaptureInput): Promise<CreateLeadResponse> {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      json?.error?.message ?? 'We could not submit your details. Please try again.';
    throw new Error(message);
  }

  return json as CreateLeadResponse;
}

/**
 * Client-side mutation for the public capture form. Per our state strategy,
 * TanStack Query owns client mutations; server reads stay in Server Components.
 */
export function useCreateLead() {
  return useMutation({ mutationFn: postLead });
}
