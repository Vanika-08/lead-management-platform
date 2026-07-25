import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/shared/status-badge';

describe('StatusBadge', () => {
  it('renders the status label', () => {
    render(<StatusBadge status="Qualified" />);
    expect(screen.getByText('Qualified')).toBeTruthy();
  });
});
