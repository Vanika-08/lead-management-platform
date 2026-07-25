/** Thin fetch wrapper for client components. Throws a friendly Error on failure. */
export async function apiRequest<T>(url: string, method: string, body?: unknown): Promise<T> {
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
