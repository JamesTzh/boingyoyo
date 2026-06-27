import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/app/ThemeProvider';
import { FeedScreen } from '@/features/marketplace/FeedScreen';

describe('FeedScreen', () => {
  it('renders listing cards', () => {
    render(<MemoryRouter><ThemeProvider><FeedScreen /></ThemeProvider></MemoryRouter>);
    expect(screen.getAllByRole('link').length).toBeGreaterThan(3);
  });
});
