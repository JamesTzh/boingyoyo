import { motion, useReducedMotion } from 'framer-motion';

export function WinScreen({ onContinue }: { onContinue: () => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={reduce ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
      >
        <div className="mb-3 text-5xl">✅</div>
        <h2 className="mb-2 text-2xl font-extrabold text-success">Nice — you spotted the scam</h2>
        <p className="mb-6 text-slate-600">You reported it instead of falling for it.</p>
        <button onClick={onContinue} className="rounded-lg bg-brand px-6 py-3 font-semibold text-brand-fg">
          See your breakdown
        </button>
      </motion.div>
    </div>
  );
}
