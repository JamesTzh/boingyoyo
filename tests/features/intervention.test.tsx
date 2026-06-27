import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GotchaModal } from '@/features/intervention/GotchaModal';

describe('GotchaModal', () => {
  it('fires onContinue', async () => {
    const onContinue = vi.fn();
    render(<GotchaModal onContinue={onContinue} />);
    expect(screen.getByText(/planted scam/i)).toBeInTheDocument();
    await userEvent.click(screen.getByText(/see what you missed/i));
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
