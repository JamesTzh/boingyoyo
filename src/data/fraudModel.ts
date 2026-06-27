// Mocked fraud-detection model data for the Admin → Fraud Detection Model tab.
//
// This is an MVP / concept surface: every value below is ILLUSTRATIVE, not from a
// live model. It exists to show the idea — that every Scam School play plus live
// listing signal feeds one model that scores each post's fraud risk. Keep all the
// invented numbers here so the components stay presentational.

export type SignalGroup = 'structured' | 'unstructured';

export interface ModelSignal {
  label: string;
  group: SignalGroup;
  hint: string;
}

/** Structured inputs — tabular features pulled straight from the listing & account. */
export const STRUCTURED_SIGNALS: ModelSignal[] = [
  { label: 'Price vs. market Δ', group: 'structured', hint: 'How far below comparable sold listings' },
  { label: 'Seller account age', group: 'structured', hint: 'Days since the account was created' },
  { label: 'Verified badges', group: 'structured', hint: 'ID, phone & payment verification' },
  { label: 'Payment method asked', group: 'structured', hint: 'Off-platform or card-detail requests' },
  { label: 'Response latency', group: 'structured', hint: 'Reply speed & burst patterns' },
  { label: 'Listing history', group: 'structured', hint: 'Volume, edits & rapid relists' },
  { label: 'Buyer protection off', group: 'structured', hint: 'Protection toggled off by the seller' },
  { label: 'Location & device', group: 'structured', hint: 'IP, geo & device reputation' },
];

/** Unstructured inputs — text, images and chat, embedded before they reach the model. */
export const UNSTRUCTURED_SIGNALS: ModelSignal[] = [
  { label: 'Listing-text NLP', group: 'unstructured', hint: 'Urgency, scarcity & scripted phrasing' },
  { label: 'Image forensics', group: 'unstructured', hint: 'Reverse-image, duplicates & manipulation' },
  { label: 'Chat intent', group: 'unstructured', hint: 'Off-platform pushes & deposit demands' },
  { label: 'Seller reply style', group: 'unstructured', hint: 'Templated, bot-like conversation' },
];

export interface RankedSignal {
  label: string;
  group: SignalGroup;
  /** Relative contribution to the score, 0–1. The list sums to ~1. */
  weight: number;
}

/** Aggregate feature importance — what the model leans on across all scored posts. */
export const SIGNAL_IMPORTANCE: RankedSignal[] = [
  { label: 'Price vs. market Δ', group: 'structured', weight: 0.19 },
  { label: 'Chat: off-platform push', group: 'unstructured', weight: 0.16 },
  { label: 'Seller account age', group: 'structured', weight: 0.13 },
  { label: 'Listing-text urgency (NLP)', group: 'unstructured', weight: 0.11 },
  { label: 'Image duplicate match', group: 'unstructured', weight: 0.1 },
  { label: 'Payment method asked', group: 'structured', weight: 0.09 },
  { label: 'Verified badges', group: 'structured', weight: 0.07 },
  { label: 'Chat: deposit demand', group: 'unstructured', weight: 0.06 },
  { label: 'Response latency', group: 'structured', weight: 0.05 },
  { label: 'Buyer protection off', group: 'structured', weight: 0.04 },
];

export const MODEL_META = {
  version: 'v0.3.1',
  /** Scoring every listing but not yet auto-actioning — observe-only. */
  mode: 'shadow mode',
  algorithm: 'Gradient-boosted trees + text/image transformer fusion',
  scoredPerDay: 1280,
};

export const PERFORMANCE = {
  precision: 0.91,
  recall: 0.84,
  auc: 0.93,
  alertsPerDay: 47,
};

/** Last 1,000 human-reviewed listings, used to frame precision/recall honestly. */
export const CONFUSION = { tp: 210, fp: 21, fn: 40, tn: 729 };

/** AUC over the last 8 weeks — drift watch. */
export const AUC_TREND = [0.88, 0.89, 0.9, 0.91, 0.92, 0.92, 0.93, 0.93];

/** Score bands. Allow < review ≤ Review < block ≤ Block. */
export const THRESHOLDS = { review: 0.55, block: 0.85 };
