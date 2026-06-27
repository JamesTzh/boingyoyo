export type ArchetypeId =
  | 'off_platform'
  | 'urgency_flash_sale'
  | 'deposit_before_meetup'
  | 'phishing_link'
  | 'counterfeit_item';

export const ARCHETYPE_IDS: ArchetypeId[] = [
  'off_platform',
  'urgency_flash_sale',
  'deposit_before_meetup',
  'phishing_link',
  'counterfeit_item',
];

export type ChallengeStatus = 'unseen' | 'in_progress' | 'defended' | 'scammed';
export type Level = 'Rookie' | 'Aware' | 'Sharp' | 'Guardian';

export type Condition = 'Brand new' | 'Like new' | 'Lightly used' | 'Well used' | 'Heavily used';

export interface Listing {
  id: string;
  archetypeId: ArchetypeId | null;
  isPlanted: boolean;
  title: string;
  price: number;
  marketPrice?: number;
  currency: string;
  photos: string[];
  sellerName: string;
  sellerBadges?: string[];
  description: string;
  playerIsSeller?: boolean;
  /** marketplace metadata used by the Carouza product card */
  category?: string;
  condition?: Condition;
  likes?: number;
  postedAt?: string; // relative timestamp e.g. "3 minutes ago"
  buyerProtection?: boolean;
}

export interface Message {
  id: string;
  role: 'player' | 'seller' | 'system';
  text: string;
  ts: number;
  viaFallback?: boolean;
}

export type QuickActionType = 'safe' | 'risky' | 'report' | 'unsafe';

export interface QuickAction {
  id: string;
  label: string;
  type: QuickActionType;
  probesRedFlagId?: string;
}

export interface RedFlag {
  id: string;
  archetypeId: ArchetypeId;
  label: string;
  explanation: string;
}

export interface ChallengeSignals {
  turnsToResolve: number;
  unsafeTaps: number;
  softRiskyEngagements: number;
  redFlagsNoticed: number;
  redFlagIdsNoticed: string[];
}

export interface ScoreBreakdown {
  detection: number;
  caution: number;
  speed: number;
  total: number;
}

export interface TraceReport {
  outcome: ChallengeStatus;
  redFlags: { flag: RedFlag; noticed: boolean }[];
  didVsShould: { did: string[]; should: string[] };
  tips: string[];
  score: ScoreBreakdown;
  summaryLine?: string;
  momentLine?: string;
  verdictReason?: string; // the LLM judge's one-line explanation of the outcome
}

export interface ChallengeState {
  archetypeId: ArchetypeId;
  status: ChallengeStatus;
  listingId: string;
  messages: Message[];
  signals: ChallengeSignals;
  score?: ScoreBreakdown;
  trace?: TraceReport;
}

export interface EventSession {
  id: string;
  startedAt: number;
  theme: { brandName: string; currency: string };
  challenges: Record<ArchetypeId, ChallengeState>;
  eventScore: number;
  level: Level;
}

export interface PlayRecord {
  archetypeId: ArchetypeId;
  outcome: 'defended' | 'scammed';
  turnsToResolve: number;
  redFlagIdsNoticed: string[];
  redFlagIdsMissed: string[];
  score: number;
  order: number;
}

export interface AggregateStat {
  archetypeId: ArchetypeId;
  attempts: number;
  fellForCount: number;
  fellForRate: number;
  avgDetectTurns: number;
  mostMissedFlags: { redFlagId: string; missRate: number }[];
}

// ---- API contracts (mirrored in server/handlers.ts) ----
export interface ChatRequest {
  archetypeId: ArchetypeId;
  theme: { brandName: string; currency: string };
  listing: { title: string; price: number; playerIsSeller?: boolean };
  history: { role: 'player' | 'seller'; text: string }[];
}
export interface ChatResponse {
  reply: string;
  viaFallback?: boolean;
}
export interface TraceRequest {
  archetypeId: ArchetypeId;
  outcome: 'defended' | 'scammed';
  transcript: { role: 'player' | 'seller'; text: string }[];
  signals: Pick<ChallengeSignals, 'turnsToResolve' | 'unsafeTaps' | 'softRiskyEngagements' | 'redFlagsNoticed'>;
}
export interface TraceResponse {
  summaryLine: string;
  momentLine: string;
}

export interface JudgeRequest {
  archetypeId: ArchetypeId;
  playerIsSeller?: boolean;
  finalAction: 'report' | 'offer';
  transcript: { role: 'player' | 'seller'; text: string }[];
  redFlags: { id: string; label: string }[];
}
export interface JudgeResponse {
  outcome: 'scammed' | 'avoided';
  redFlagIdsNoticed: string[];
  reason: string;
}

export interface ThemeConfig {
  brandName: string;
  currency: string;
  logo: string;
  colors: {
    primary: string;
    primaryFg: string;
    bg: string;
    surface: string;
    text: string;
    muted: string;
    danger: string;
    success: string;
  };
  listingCard: 'grid' | 'list';
  demoMode: boolean;
}
