import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReportScreen } from '@/features/report/ReportScreen';
import { useStore } from '@/lib/store';

beforeEach(() => {
  useStore.getState().reset();
  useStore.getState().startEvent({ brandName: 'Marketly', currency: 'SGD' });
  useStore.getState().openChallenge('off_platform');
  useStore.getState().applyQuickAction('off_platform', { id: 'op_report', label: 'Report this seller', type: 'report' });
});

describe('ReportScreen', () => {
  it('shows the defended scam and remaining not-found ones', () => {
    render(<MemoryRouter><ReportScreen /></MemoryRouter>);
    expect(screen.getByText(/Off-platform transaction/)).toBeInTheDocument();
    expect(screen.getByText(/haven't found yet/i)).toBeInTheDocument();
  });
});
