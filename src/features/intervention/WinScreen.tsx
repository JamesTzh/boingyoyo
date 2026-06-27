import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function WinScreen({ onContinue, reason }: { onContinue: () => void; reason?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={reduce ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mx-4 max-w-md rounded-2xl border border-teal/30 bg-card p-8 text-center shadow-lift"
      >
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-teal/15 text-3xl">✅</div>
        <h2 className="mb-2 text-2xl font-extrabold text-teal-bright">Nice — you spotted the scam</h2>
        <p className="mb-6 text-ink-muted">{reason || 'You stayed safe instead of falling for it.'}</p>
        <Button size="lg" onClick={onContinue} className="w-full">
          See your breakdown
        </Button>
      </motion.div>
    </div>
  );
}
