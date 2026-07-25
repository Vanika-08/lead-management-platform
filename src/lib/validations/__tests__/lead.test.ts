import { leadCaptureSchema, leadCreateSchema } from '@/lib/validations/lead';

describe('leadCaptureSchema', () => {
  it('accepts a valid public capture payload', () => {
    const result = leadCaptureSchema.safeParse({
      name: 'Priya Nair',
      email: 'priya@acme.io',
      company: 'Acme',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = leadCaptureSchema.safeParse({ name: 'Test User', email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects a too-short name', () => {
    const result = leadCaptureSchema.safeParse({ name: 'A', email: 'a@b.com' });
    expect(result.success).toBe(false);
  });
});

describe('leadCreateSchema', () => {
  it('applies safe defaults for status, tag and source', () => {
    const result = leadCreateSchema.safeParse({ name: 'New Lead', email: 'lead@co.com' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('New');
      expect(result.data.tag).toBeNull();
      expect(result.data.source).toBe('Manual');
    }
  });
});
