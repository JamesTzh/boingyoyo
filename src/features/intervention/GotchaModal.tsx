import { motion, useReducedMotion } from 'framer-motion';

export function GotchaModal({ onContinue }: { onContinue: () => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={reduce ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
        animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1, x: [0, -8, 8, -4, 0] }}
        transition={{ duration: 0.4 }}
        className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
      >
        <div className="mb-3 text-5xl">⚠️</div>
        <h2 className="mb-2 text-2xl font-extrabold text-danger">This was a planted scam</h2>
        <p className="mb-6 text-slate-600">…and you were about to fall for it.</p>
        <button onClick={onContinue} className="rounded-lg bg-brand px-6 py-3 font-semibold text-brand-fg">
          See what you missed
        </button>
      </motion.div>
    </div>
  );
}
