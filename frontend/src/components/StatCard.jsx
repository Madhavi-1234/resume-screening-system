import { motion } from "framer-motion";

export default function StatCard({ label, value, hint }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5">
      <p className="text-sm text-slate-500 dark:text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">{hint}</p>
    </motion.div>
  );
}
