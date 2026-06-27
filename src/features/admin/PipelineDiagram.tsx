import { motion, useReducedMotion } from 'framer-motion';
import {
  BrainCircuit,
  ChevronDown,
  Database,
  MessagesSquare,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MODEL_META,
  STRUCTURED_SIGNALS,
  UNSTRUCTURED_SIGNALS,
  THRESHOLDS,
  type ModelSignal,
} from '@/data/fraudModel';

const pct = (n: number) => Math.round(n * 100);

// The signature element. Reads left→right on desktop, top→bottom on mobile:
// structured + unstructured signals flow into one fused model, which emits a
// fraud probability and a decision band. Motion is reserved for the core's pulse
// and the data flowing along the wires — everything else stays still.
export function PipelineDiagram() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold text-ink">How a post gets scored</h2>
        <span className="text-[12px] text-ink-muted">{MODEL_META.scoredPerDay.toLocaleString()} listings / day</span>
      </div>

      <div className="mt-5 flex flex-col items-stretch lg:flex-row lg:items-center">
        <InputsStage />
        <Connector />
        <CoreStage />
        <Connector />
        <OutputStage />
      </div>
    </section>
  );
}

function StageLabel({ children }: { children: string }) {
  return (
    <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted lg:text-left">
      {children}
    </div>
  );
}

function InputsStage() {
  return (
    <div className="lg:w-[34%] lg:shrink-0">
      <StageLabel>Inputs</StageLabel>
      <div className="space-y-2.5">
        <SignalGroup
          tone="structured"
          Icon={Database}
          title="Structured"
          caption="tabular features"
          signals={STRUCTURED_SIGNALS}
        />
        <SignalGroup
          tone="unstructured"
          Icon={MessagesSquare}
          title="Unstructured"
          caption="text · image · chat"
          signals={UNSTRUCTURED_SIGNALS}
        />
      </div>
    </div>
  );
}

function SignalGroup({
  tone,
  Icon,
  title,
  caption,
  signals,
}: {
  tone: 'structured' | 'unstructured';
  Icon: LucideIcon;
  title: string;
  caption: string;
  signals: ModelSignal[];
}) {
  const accent = tone === 'structured' ? 'text-teal-bright' : 'text-coral-bright';
  const ring = tone === 'structured' ? 'border-teal/25' : 'border-coral/25';
  const chip =
    tone === 'structured'
      ? 'border-teal/20 bg-teal/[0.07] text-ink'
      : 'border-coral/20 bg-coral/[0.07] text-ink';
  return (
    <div className={cn('rounded-xl border bg-surface-2/30 p-3', ring)}>
      <div className="mb-2 flex items-center gap-2">
        <Icon className={cn('h-4 w-4', accent)} />
        <span className="text-[13px] font-semibold text-ink">{title}</span>
        <span className="text-[11px] text-ink-muted">· {caption}</span>
        <span className={cn('ml-auto text-[11px] font-semibold', accent)}>{signals.length}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {signals.map((s) => (
          <span
            key={s.label}
            title={s.hint}
            className={cn('rounded-md border px-2 py-1 text-[11px] leading-none', chip)}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function CoreStage() {
  const reduce = useReducedMotion();
  return (
    <div className="lg:w-[30%] lg:shrink-0">
      <StageLabel>Model</StageLabel>
      <div className="relative grid place-items-center rounded-xl border border-teal/30 bg-teal/[0.06] px-4 py-5">
        {/* pulsing halo — the one continuous motion in the diagram */}
        {!reduce && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute h-20 w-20 rounded-full bg-teal/20 blur-xl"
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-teal to-teal-bright text-[#062a20] shadow-[0_8px_24px_-8px_rgba(30,214,160,0.6)]">
          <BrainCircuit className="h-7 w-7" />
        </div>
        <div className="relative mt-3 text-center">
          <div className="text-[14px] font-bold text-ink">Fraud model</div>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
              {MODEL_META.version}
            </span>
            <span className="rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-semibold text-teal-bright">
              {MODEL_META.mode}
            </span>
          </div>
        </div>
        {/* the two heads it fuses — one per data type */}
        <div className="relative mt-3 w-full space-y-1.5">
          <FuseRow tone="structured" text="Gradient-boosted trees" />
          <FuseRow tone="unstructured" text="Text + image transformer" />
        </div>
      </div>
    </div>
  );
}

function FuseRow({ tone, text }: { tone: 'structured' | 'unstructured'; text: string }) {
  const dot = tone === 'structured' ? 'bg-teal-bright' : 'bg-coral-bright';
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-bg/40 px-2.5 py-1.5">
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dot)} />
      <span className="truncate text-[11px] text-ink-muted">{text}</span>
    </div>
  );
}

function OutputStage() {
  return (
    <div className="lg:w-[36%] lg:shrink-0">
      <StageLabel>Output</StageLabel>
      <div className="rounded-xl border border-border bg-surface-2/30 p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-ink">Fraud probability</span>
          <span className="font-mono text-[12px] text-ink-muted">0.00–1.00</span>
        </div>
        {/* the score scale, banded by the review & block thresholds */}
        <div className="mt-2.5 flex h-2.5 overflow-hidden rounded-full">
          <span className="bg-teal/70" style={{ width: `${pct(THRESHOLDS.review)}%` }} />
          <span className="bg-amber-400/80" style={{ width: `${pct(THRESHOLDS.block - THRESHOLDS.review)}%` }} />
          <span className="flex-1 bg-coral/80" />
        </div>
        <div className="mt-3 space-y-1.5">
          <DecisionRow tone="allow" label="Allow" range={`< ${THRESHOLDS.review.toFixed(2)}`} note="published" />
          <DecisionRow
            tone="review"
            label="Review"
            range={`${THRESHOLDS.review.toFixed(2)}–${THRESHOLDS.block.toFixed(2)}`}
            note="queued for a human"
          />
          <DecisionRow tone="block" label="Block" range={`≥ ${THRESHOLDS.block.toFixed(2)}`} note="auto-hidden" />
        </div>
        <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-border bg-bg/40 px-2.5 py-2">
          <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-teal-bright" />
          <span className="text-[11px] leading-snug text-ink-muted">
            In shadow mode the model only scores — a person still makes every call.
          </span>
        </div>
      </div>
    </div>
  );
}

function DecisionRow({
  tone,
  label,
  range,
  note,
}: {
  tone: 'allow' | 'review' | 'block';
  label: string;
  range: string;
  note: string;
}) {
  const dot = tone === 'allow' ? 'bg-teal-bright' : tone === 'review' ? 'bg-amber-400' : 'bg-coral-bright';
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span className={cn('h-2 w-2 shrink-0 rounded-full', dot)} />
      <span className="font-semibold text-ink">{label}</span>
      <span className="font-mono text-[11px] text-ink-muted">{range}</span>
      <span className="ml-auto text-[11px] text-ink-muted">{note}</span>
    </div>
  );
}

// Direction-aware connector: a vertical wire between stacked stages on mobile,
// a horizontal one between side-by-side stages on desktop. A faint pulse travels
// along it to suggest data in motion (held still when reduced motion is set).
function Connector() {
  const reduce = useReducedMotion();
  return (
    <div className="flex items-center justify-center py-1.5 lg:px-1.5 lg:py-0">
      {/* vertical (mobile) */}
      <div className="relative flex h-7 w-px items-center justify-center lg:hidden">
        <span className="absolute inset-0 bg-gradient-to-b from-teal/10 via-teal/45 to-teal/10" />
        {!reduce && (
          <motion.span
            className="absolute h-1.5 w-1.5 rounded-full bg-teal-bright shadow-[0_0_8px_2px_rgba(30,214,160,0.5)]"
            animate={{ top: ['-6%', '106%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}
        <ChevronDown className="absolute -bottom-1.5 h-3 w-3 text-teal/60" />
      </div>
      {/* horizontal (desktop) */}
      <div className="relative hidden h-px w-11 items-center lg:flex">
        <span className="absolute inset-0 bg-gradient-to-r from-teal/10 via-teal/45 to-teal/10" />
        {!reduce && (
          <motion.span
            className="absolute h-1.5 w-1.5 rounded-full bg-teal-bright shadow-[0_0_8px_2px_rgba(30,214,160,0.5)]"
            animate={{ left: ['-8%', '108%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>
    </div>
  );
}
