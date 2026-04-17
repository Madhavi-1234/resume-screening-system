import { motion } from "framer-motion";
import { formatPercent } from "../utils/format";

export default function ResultsTable({ results, selectedId, onSelect }) {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200/70 bg-slate-50/70 dark:border-white/10 dark:bg-white/5">
            <tr>
              {["Name", "ATS Score", "Match %", "Matched Skills", "Missing Skills"].map((column) => (
                <th key={column} className="px-5 py-4 font-medium text-slate-500 dark:text-slate-300">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((candidate, index) => (
              <motion.tr
                key={candidate.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => onSelect(candidate.id)}
                className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5 ${
                  selectedId === candidate.id ? "bg-brand-500/10" : ""
                }`}
              >
                <td className="px-5 py-4 font-medium">{candidate.candidate_name}</td>
                <td className="px-5 py-4">
                  <div className="w-28">
                    <div className="mb-2 flex items-center justify-between">
                      <span>{candidate.ats_score}</span>
                      <span className="text-xs text-slate-400">ATS</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10">
                      <div className="h-2 rounded-full bg-brand-500" style={{ width: `${candidate.ats_score}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">{formatPercent(candidate.score)}</td>
                <td className="px-5 py-4 text-brand-600 dark:text-brand-400">
                  {candidate.matched_skills.slice(0, 4).join(", ") || "No direct match"}
                </td>
                <td className="px-5 py-4 text-rose-500">
                  {candidate.missing_skills.slice(0, 4).join(", ") || "None"}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
