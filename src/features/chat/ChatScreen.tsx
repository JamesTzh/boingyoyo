import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { listingById } from '@/data/listings';
import { pickSuggestions, type Suggestion } from '@/data/suggestions';
import { redFlagsFor } from '@/data/redFlags';
import { useStore } from '@/lib/store';
import { useTheme } from '@/app/ThemeProvider';
import { postChat, postJudge } from '@/lib/api';
import type { QuickActionType } from '@/lib/types';
import { Avatar } from '@/components/ui/avatar';
import { MessageBubble } from './MessageBubble';
import { SuggestionBar, type EndAction } from './SuggestionBar';
import { GotchaModal } from '@/features/intervention/GotchaModal';
import { WinScreen } from '@/features/intervention/WinScreen';

type Turn = { role: 'player' | 'seller'; text: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
// Real sellers don't reply instantly — wait a believable 1–3s. Disabled under test.
const replyDelay = () => (import.meta.env.MODE === 'test' ? 0 : 1000 + Math.floor(Math.random() * 2000));

export function ChatScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const listing = id ? listingById(id) : undefined;

  const session = useStore((s) => s.session);
  const openChallenge = useStore((s) => s.openChallenge);
  const appendMessage = useStore((s) => s.appendMessage);
  const applyQuickAction = useStore((s) => s.applyQuickAction);
  const resolveByVerdict = useStore((s) => s.resolveByVerdict);

  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [judging, setJudging] = useState(false);
  const [text, setText] = useState('');
  const [overlay, setOverlay] = useState<null | 'scammed' | 'defended'>(null);
  const [verdictReason, setVerdictReason] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const usedRef = useRef<Set<string>>(new Set());

  const archetypeId = listing?.archetypeId ?? null;
  const active = Boolean(archetypeId && session); // a real challenge is in play
  const challenge = archetypeId && session ? session.challenges[archetypeId] : undefined;
  const messageCount = challenge?.messages.length ?? 0;
  const sentOpening = useRef(false);

  // Fetch a seller reply for the given history: wait 1–3s (typing) and call the LLM.
  const getSellerReply = useCallback(
    async (history: Turn[]) => {
      if (!archetypeId || !listing) return;
      setSending(true);
      setTyping(true);
      try {
        const [res] = await Promise.all([
          postChat({
            archetypeId,
            theme: { brandName: theme.brandName, currency: theme.currency },
            listing: { title: listing.title, price: listing.price, playerIsSeller: listing.playerIsSeller },
            history,
          }),
          sleep(replyDelay()),
        ]);
        appendMessage(archetypeId, { role: 'seller', text: res.reply, viaFallback: res.viaFallback });
      } finally {
        setSending(false);
        setTyping(false);
      }
    },
    [archetypeId, listing, theme, appendMessage],
  );

  useEffect(() => {
    if (active && archetypeId) openChallenge(archetypeId);
  }, [active, archetypeId, openChallenge]);

  useEffect(() => {
    if (active && archetypeId) setSuggestions(pickSuggestions(archetypeId, usedRef.current, 3));
  }, [active, archetypeId]);

  // Auto-send the opening seller line once. `sentOpening` guards StrictMode's
  // double-invoke; we don't cancel on cleanup or the only reply gets dropped.
  useEffect(() => {
    if (!active || messageCount !== 0 || sentOpening.current) return;
    sentOpening.current = true;
    void getSellerReply([]);
  }, [active, messageCount, getSellerReply]);

  if (!listing) return <div className="p-8 text-ink-muted">Listing not found.</div>;

  // Benign chat: genuine decoy, or a player who opted out of the event.
  if (!active) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center gap-3">
          <Avatar name={listing.sellerName} size={40} />
          <h2 className="font-bold text-ink">{listing.sellerName}</h2>
        </div>
        <div className="mt-4 max-w-[78%] rounded-2xl rounded-bl-sm bg-surface-2 px-3.5 py-2 text-sm text-ink">
          Hi! Yes it&apos;s available, when would you like to collect?
        </div>
      </div>
    );
  }

  const aId = archetypeId!;
  const messages = challenge?.messages ?? [];
  const history = (): Turn[] => messages.map((m) => ({ role: m.role as 'player' | 'seller', text: m.text }));
  const reroll = () => setSuggestions(pickSuggestions(aId, usedRef.current, 3));
  const busy = sending || judging;

  const sendFreeText = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setText('');
    const h = history();
    appendMessage(aId, { role: 'player', text: t });
    await getSellerReply([...h, { role: 'player', text: t }]);
    reroll();
  };

  // A suggested reply behaves exactly like a typed message, but also records the
  // intent (probing a flag / engaging the bait) for scoring.
  const sendSuggestion = async (s: Suggestion) => {
    if (busy) return;
    const type: QuickActionType = s.kind === 'risky' ? 'risky' : 'safe';
    const h = history();
    applyQuickAction(aId, { id: s.id, label: s.text, type, probesRedFlagId: s.probesRedFlagId });
    usedRef.current.add(s.id);
    await getSellerReply([...h, { role: 'player', text: s.text }]);
    reroll();
  };

  // End the conversation. The LLM judges the whole chat to decide whether the
  // player was scammed or avoided it — for BOTH report and make-offer.
  const endConversation = async (action: EndAction) => {
    if (busy) return;
    const convo = history();
    const label = action === 'report' ? 'Report this listing' : 'Make offer';
    appendMessage(aId, { role: 'player', text: label });
    setJudging(true);
    try {
      const verdict = await postJudge({
        archetypeId: aId,
        playerIsSeller: listing.playerIsSeller,
        finalAction: action,
        transcript: convo,
        redFlags: redFlagsFor(aId).map((f) => ({ id: f.id, label: f.label })),
      });
      resolveByVerdict(aId, verdict);
      setVerdictReason(verdict.reason);
      setOverlay(verdict.outcome === 'scammed' ? 'scammed' : 'defended');
    } finally {
      setJudging(false);
    }
  };

  const proceed = () => navigate(`/trace/${aId}`);

  return (
    <div className="mx-auto flex h-[calc(100vh-56px)] max-w-2xl flex-col">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <Avatar name={listing.sellerName} size={32} />
        <div className="text-sm">
          <div className="font-semibold text-ink">{listing.sellerName}</div>
          <div className="text-[12px] text-ink-muted">{listing.title}</div>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => <MessageBubble key={m.id} msg={m} />)}
        {typing && (
          <div className="flex items-center gap-1 px-1 text-ink-muted">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted" />
          </div>
        )}
      </div>

      {messages.length > 0 && (
        <SuggestionBar suggestions={suggestions} onSend={sendSuggestion} onEnd={endConversation} disabled={busy} />
      )}

      <div className="flex gap-2 border-t border-border bg-bg-nav/60 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendFreeText()}
          placeholder="Type a message…"
          disabled={busy}
          className="flex-1 rounded-full bg-surface-input px-4 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
        />
        <button
          onClick={sendFreeText}
          disabled={busy || !text.trim()}
          className="inline-flex w-20 items-center justify-center rounded-full bg-teal px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-teal-bright disabled:opacity-60"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
        </button>
      </div>

      {judging && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm text-ink shadow-lift">
            <Loader2 className="h-5 w-5 animate-spin text-teal-bright" />
            Reviewing how that went…
          </div>
        </div>
      )}

      {overlay === 'scammed' && <GotchaModal reason={verdictReason} onContinue={proceed} />}
      {overlay === 'defended' && <WinScreen reason={verdictReason} onContinue={proceed} />}
    </div>
  );
}
