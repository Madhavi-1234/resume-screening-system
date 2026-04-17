import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function CandidatesChart({ data }) {
  return (
    <div className="glass-panel h-80 p-5">
      <div className="mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-300">Score visualization</p>
        <h3 className="text-xl font-semibold">ATS ranking overview</h3>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <XAxis dataKey="candidate_name" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="ats_score" radius={[12, 12, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.id} fill={entry.ats_score >= 80 ? "#14b8a6" : entry.ats_score >= 60 ? "#f59e0b" : "#ef4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
