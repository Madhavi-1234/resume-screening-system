import { motion } from "framer-motion";

export default function AuthCard({ mode, form, setForm, loading, error, onSubmit, onModeChange }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass-panel w-full max-w-md p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600 dark:text-brand-400">
        AI Resume Screening
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">
        {mode === "login" ? "Welcome back" : "Create your recruiter workspace"}
      </h1>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
        Secure JWT auth, ATS scoring, candidate ranking, and resume insights in one place.
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        {mode === "signup" && (
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Full name"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-white/5"
          />
        )}
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="Work email"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-white/5"
        />
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          placeholder="Password"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-white/5"
        />

        {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-brand-500 dark:text-slate-950"
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button className="mt-5 text-sm text-slate-500 dark:text-slate-300" onClick={onModeChange}>
        {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </motion.div>
  );
}
