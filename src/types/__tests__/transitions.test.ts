import { canTransition, STATUS_TRANSITIONS, LEAD_STATUSES } from '@/types';

describe('lead status transitions', () => {
  it('allows the documented forward moves', () => {
    expect(canTransition('New', 'Contacted')).toBe(true);
    expect(canTransition('Contacted', 'Qualified')).toBe(true);
    expect(canTransition('Qualified', 'Proposal Sent')).toBe(true);
    expect(canTransition('Proposal Sent', 'Won')).toBe(true);
  });

  it('allows moving to Lost from any non-terminal state', () => {
    for (const from of LEAD_STATUSES) {
      if (from === 'Won' || from === 'Lost') continue;
      expect(canTransition(from, 'Lost')).toBe(true);
    }
  });

  it('treats Won and Lost as terminal', () => {
    expect(STATUS_TRANSITIONS.Won).toHaveLength(0);
    expect(STATUS_TRANSITIONS.Lost).toHaveLength(0);
    for (const to of LEAD_STATUSES) {
      expect(canTransition('Won', to)).toBe(false);
      expect(canTransition('Lost', to)).toBe(false);
    }
  });

  it('rejects illegal skips', () => {
    expect(canTransition('New', 'Won')).toBe(false);
    expect(canTransition('New', 'Qualified')).toBe(false);
    expect(canTransition('Contacted', 'Won')).toBe(false);
  });
});
