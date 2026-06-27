import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/app/ThemeProvider';
import { ChatScreen } from '@/features/chat/ChatScreen';
import { useStore } from '@/lib/store';

beforeEach(() => {
  useStore.getState().reset();
  useStore.getState().startEvent({ brandName: 'Marketly', currency: 'SGD' });
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ reply: 'hey, still available' }), { status: 200 })));
});

function renderChat() {
  return render(
    <MemoryRouter initialEntries={['/chat/p-off']}>
      <ThemeProvider>
        <Routes>
          <Route path="/chat/:id" element={<ChatScreen />} />
          <Route path="/trace/:archetypeId" element={<div>TRACE PAGE</div>} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe('ChatScreen', () => {
  it('tapping the unsafe action resolves as scammed and shows the gotcha', async () => {
    renderChat();
    await waitFor(() => expect(screen.getByText('Message them on WhatsApp')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Message them on WhatsApp'));
    expect(useStore.getState().session!.challenges.off_platform.status).toBe('scammed');
    expect(screen.getByText(/planted scam/i)).toBeInTheDocument();
  });
});
