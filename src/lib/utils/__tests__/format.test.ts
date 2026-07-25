import { initials } from '@/lib/utils/format';

describe('initials', () => {
  it('takes the first two words', () => {
    expect(initials('Ava Admin')).toBe('AA');
    expect(initials('max member example')).toBe('MM');
  });

  it('handles a single name', () => {
    expect(initials('Cher')).toBe('C');
  });
});
