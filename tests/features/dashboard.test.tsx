import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';

describe('DashboardScreen', () => {
  it('renders the fell-for ranking from seed data', () => {
    render(<MemoryRouter><DashboardScreen /></MemoryRouter>);
    expect(screen.getByText(/fool the most people/i)).toBeInTheDocument();
    expect(screen.getAllByText(/fell for it/i).length).toBe(5);
  });
});
