import { Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { useTheme } from './ThemeProvider';

export function Header() {
  const theme = useTheme();
  const session = useStore((s) => s.session);
  const challenges = session ? Object.values(session.challenges) : [];
  const found = challenges.filter((c) => c.status !== 'unseen').length;
  const defended = challenges.filter((c) => c.status === 'defended').length;
  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-3">
      <Link to="/feed" className="text-lg font-bold text-brand">{theme.brandName}</Link>
      {session && (
        <div className="flex items-center gap-4 text-sm">
          <span>🔎 Found {found}/5</span>
          <span>🛡️ Defended {defended}</span>
          <Link to="/report" className="rounded bg-brand px-3 py-1 text-brand-fg">My report</Link>
        </div>
      )}
    </header>
  );
}
