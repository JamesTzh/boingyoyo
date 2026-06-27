import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, MessageSquareWarning } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useTheme } from '@/app/ThemeProvider';
import { Logo } from '@/app/Header';
import { Button } from '@/components/ui/button';

const STEPS = [
  { icon: Search, title: 'Browse like normal', body: 'Five fake listings are hidden among real ones. They look completely legit.' },
  { icon: MessageSquareWarning, title: 'Chat with the “seller”', body: 'An AI runs a real scam playbook — urgency, deposits, off-platform nudges.' },
  { icon: ShieldCheck, title: 'Spot it, report it', body: 'Catch the red flag before you pay. We grade every move and show what you missed.' },
];

export function IntroScreen() {
  const navigate = useNavigate();
  const theme = useTheme();
  const startEvent = useStore((s) => s.startEvent);
  const reset = useStore((s) => s.reset);

  const begin = () => {
    startEvent({ brandName: theme.brandName, currency: theme.currency });
    navigate('/feed');
  };

  // Opt out: this is a consensual event, so leaving is one tap — browse Carouza
  // normally with no planted scams or interventions.
  const optOut = () => {
    reset();
    navigate('/feed');
  };

  return (
    <div className="relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-teal/15 blur-[120px]" />

      <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-teal-bright">
          <ShieldCheck className="h-3.5 w-3.5" />
          Phish n Cheats · Live event
        </div>

        <h1 className="text-balance text-4xl font-extrabold leading-[1.1] text-ink sm:text-5xl">
          Get scammed on purpose.<br />
          <span className="text-teal-bright">Learn it for real.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-[15px] leading-relaxed text-ink-muted">
          During this event, fake scam listings are hidden among the real ones on {theme.brandName}.
          Your mission: find all <strong className="text-ink">5</strong>. They are built to look completely
          real — so stay sharp.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3">
          <Button size="lg" onClick={begin}>
            I&apos;m in — start hunting
          </Button>
          <button
            onClick={optOut}
            className="text-[13px] text-ink-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            No thanks — just browse {theme.brandName}
          </button>
        </div>

        <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal/15 text-teal-bright">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3.5 font-semibold text-ink">{title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
