import { motion } from "framer-motion";
import { formatPercent } from "../utils/format";

function TagGroup({ title, items, tone = "default" }) {
  const styles = {
    default: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-100",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
    danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
  };

  return (
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length ? items.map((item) => (
          <span key={item} className={`rounded-full px-3 py-1 text-xs font-medium ${styles[tone]}`}>
            {item}
          </span>
        )) : <span className="text-sm text-slate-400">No data available</span>}
      </div>
    </div>
  );
}

export default function CandidateDrawer({ candidate, onClose }) {
  if (!candidate) {
    return (
      <div className="glass-panel flex h-full items-center justify-center p-8 text-center text-sm text-slate-500 dark:text-slate-300">
        Select a candidate to inspect extracted skills, ATS reasoning, and keyword highlighting.
      </div>
    );
  }

  return (
    <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="glass-panel h-full p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">Candidate insights</p>
          <h2 className="mt-2 text-2xl font-semibold">{candidate.candidate_name}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{candidate.file_name}</p>
        </div>
        <button onClick={onClose} className="text-sm text-slate-400">Close</button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/5">
          <p className="text-sm text-slate-500 dark:text-slate-300">ATS score</p>
          <p className="mt-2 text-3xl font-semibold">{candidate.ats_score}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/5">
          <p className="text-sm text-slate-500 dark:text-slate-300">Semantic match</p>
          <p className="mt-2 text-3xl font-semibold">{formatPercent(candidate.score)}</p>
        </div>
      </div>

      <div className="mt-6 space-y-6 text-sm">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">Summary</p>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{candidate.summary}</p>
          <p className="mt-3 text-slate-500 dark:text-slate-300">{candidate.explanation}</p>
        </div>

        <TagGroup title="Matched skills" items={candidate.matched_skills} tone="success" />
        <TagGroup title="Missing skills" items={candidate.missing_skills} tone="danger" />
        <TagGroup title="Extracted skills" items={candidate.extracted_skills} />
        <TagGroup title="Experience keywords" items={candidate.experience_keywords} />

        <div>
          <p className="font-medium text-slate-900 dark:text-white">Resume suggestions</p>
          <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-300">
            {(candidate.suggestions.length ? candidate.suggestions : ["Add measurable outcomes and clarify missing role-specific skills."]).map((tip) => (
              <li key={tip} className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-white/5">
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-medium text-slate-900 dark:text-white">Keyword highlighting</p>
          <div
            className="scrollbar-thin mt-3 max-h-64 overflow-auto rounded-2xl bg-slate-100 p-4 leading-7 dark:bg-white/5 [&_mark]:rounded [&_mark]:bg-amber-300 [&_mark]:px-1 [&_mark]:text-slate-950"
            dangerouslySetInnerHTML={{ __html: candidate.highlighted_resume_text }}
          />
        </div>
      </div>
    </motion.aside>
  );
}
