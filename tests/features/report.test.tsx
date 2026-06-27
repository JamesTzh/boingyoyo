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
    expect(screen.getByText('Off-platform deal')).toBeInTheDocument();
    // "Defended" appears as both a KPI label and the status badge
    expect(screen.getAllByText('Defended').length).toBeGreaterThan(0);
    expect(screen.getByText(/Still to learn/i)).toBeInTheDocument();
  });
});
