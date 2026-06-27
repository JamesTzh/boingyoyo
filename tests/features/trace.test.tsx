import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TraceScreen } from '@/features/grading/TraceScreen';
import { useStore } from '@/lib/store';

beforeEach(() => {
  useStore.getState().reset();
  useStore.getState().startEvent({ brandName: 'Marketly', currency: 'SGD' });
  useStore.getState().openChallenge('deposit_before_meetup');
  useStore.getState().applyQuickAction('deposit_before_meetup', { id: 'dm_unsafe', label: 'Send deposit', type: 'unsafe' });
  vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 503 })));
});

describe('TraceScreen', () => {
  it('renders the skeleton trace with red flags and a score', () => {
    render(
      <MemoryRouter initialEntries={['/trace/deposit_before_meetup']}>
        <Routes><Route path="/trace/:archetypeId" element={<TraceScreen />} /></Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText(/you got scammed/i)).toBeInTheDocument();
    expect(screen.getByText(/Score:/)).toBeInTheDocument();
  });
});
