import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingById } from '@/data/listings';
import { challengeDef } from '@/data/challenges';
import { useStore } from '@/lib/store';
import { useTheme } from '@/app/ThemeProvider';
import { postChat } from '@/lib/api';
import type { QuickAction } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { QuickActionBar } from './QuickActionBar';
import { GotchaModal } from '@/features/intervention/GotchaModal';
import { WinScreen } from '@/features/intervention/WinScreen';

export function ChatScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const listing = id ? listingById(id) : undefined;

  const session = useStore((s) => s.session);
  const openChallenge = useStore((s) => s.openChallenge);
  const appendMessage = useStore((s) => s.appendMessage);
  const applyQuickAction = useStore((s) => s.applyQuickAction);

  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const [overlay, setOverlay] = useState<null | 'scammed' | 'defended'>(null);

  const archetypeId = listing?.archetypeId ?? null;
  const challenge = archetypeId && session ? session.challenges[archetypeId] : undefined;
  const messageCount = challenge?.messages.length ?? 0;
  const sentOpening = useRef(false);

  // Open the challenge when a planted listing loads.
  useEffect(() => {
    if (archetypeId) openChallenge(archetypeId);
  }, [archetypeId, openChallenge]);

  // Auto-send a single opening seller line (all hooks must precede early returns).
  useEffect(() => {
    if (!archetypeId || !listing || messageCount !== 0 || sentOpening.current) return;
    sentOpening.current = true;
    let cancelled = false;
    void (async () => {
      setTyping(true);
      const res = await postChat({
        archetypeId,
        theme: { brandName: theme.brandName, currency: theme.currency },
        listing: { title: listing.title, price: listing.price, playerIsSeller: listing.playerIsSeller },
        history: [],
      });
      if (cancelled) return;
      setTyping(false);
      appendMessage(archetypeId, { role: 'seller', text: res.reply, viaFallback: res.viaFallback });
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archetypeId, messageCount]);

  if (!listing) return <div className="p-8">Listing not found.</div>;

  // Genuine decoy: a benign, no-challenge chat.
  if (!archetypeId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h2 className="mb-2 font-bold">{listing.sellerName}</h2>
        <p className="text-slate-600">"Hi! Yes it's available, when would you like to collect?"</p>
      </div>
    );
  }

  const def = challengeDef(archetypeId);
  const messages = challenge?.messages ?? [];

  const sendFreeText = async () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    appendMessage(archetypeId, { role: 'player', text: t });
    setTyping(true);
    const res = await postChat({
      archetypeId,
      theme: { brandName: theme.brandName, currency: theme.currency },
      listing: { title: listing.title, price: listing.price, playerIsSeller: listing.playerIsSeller },
      history: [...messages, { id: 'tmp', ts: 0, role: 'player', text: t }].map((m) => ({ role: m.role as 'player' | 'seller', text: m.text })),
    });
    setTyping(false);
    appendMessage(archetypeId, { role: 'seller', text: res.reply, viaFallback: res.viaFallback });
  };

  const pick = (a: QuickAction) => {
    applyQuickAction(archetypeId, a);
    if (a.type === 'unsafe') setOverlay('scammed');
    else if (a.type === 'report') setOverlay('defended');
  };

  const proceed = () => navigate(`/trace/${archetypeId}`);

  return (
    <div className="mx-auto flex h-[calc(100vh-57px)] max-w-2xl flex-col">
      <div className="border-b px-4 py-2 text-sm text-slate-600">
        Chat with {listing.playerIsSeller ? 'buyer' : listing.sellerName}
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => <MessageBubble key={m.id} msg={m} />)}
        {typing && <div className="text-xs text-slate-400">typing…</div>}
      </div>
      {messages.length > 0 && <QuickActionBar actions={def.quickActions} onPick={pick} />}
      <div className="flex gap-2 border-t bg-white p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendFreeText()}
          placeholder="Type a message…"
          className="flex-1 rounded-full border px-4 py-2 text-sm"
        />
        <button onClick={sendFreeText} className="rounded-full bg-brand px-4 py-2 text-sm text-brand-fg">Send</button>
      </div>
      {overlay === 'scammed' && <GotchaModal onContinue={proceed} />}
      {overlay === 'defended' && <WinScreen onContinue={proceed} />}
    </div>
  );
}
