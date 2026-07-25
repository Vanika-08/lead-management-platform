import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { toErrorResponse, type ErrorResponseBody } from '@/lib/utils/errors';

/**
 * Wraps a route handler so every thrown error becomes a consistent JSON
 * envelope with the right status. ZodError is treated as a 400 with field
 * details; AppError subclasses map to their statusCode; anything else is 500.
 */
export async function withErrorHandler(
  fn: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ZodError) {
      const body: ErrorResponseBody = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input.',
          details: err.flatten().fieldErrors,
        },
      };
      return NextResponse.json(body, { status: 400 });
    }
    const { status, body } = toErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}
