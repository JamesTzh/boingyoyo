import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { useTheme } from '@/app/ThemeProvider';

export function IntroScreen() {
  const navigate = useNavigate();
  const theme = useTheme();
  const startEvent = useStore((s) => s.startEvent);

  const begin = () => {
    startEvent({ brandName: theme.brandName, currency: theme.currency });
    navigate('/feed');
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="mb-4 text-4xl font-extrabold">Welcome to Scam School</h1>
      <p className="mb-8 text-lg text-slate-600">
        During this event, fake scam listings are hidden among the real ones on {theme.brandName}.
        Your mission: find all <strong>5</strong>. They are designed to look completely real — so stay sharp.
      </p>
      <button onClick={begin} className="rounded-lg bg-brand px-6 py-3 text-lg font-semibold text-brand-fg">
        I'm in — start hunting
      </button>
    </div>
  );
}
