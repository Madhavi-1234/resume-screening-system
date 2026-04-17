import { useEffect, useMemo, useState } from "react";
import { Download, Filter, LogOut, Search } from "lucide-react";
import { motion } from "framer-motion";
import { screeningApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { getErrorMessage } from "../utils/errors";
import { downloadBlob } from "../utils/format";
import ThemeToggle from "../components/ThemeToggle";
import DropZone from "../components/DropZone";
import StatCard from "../components/StatCard";
import CandidatesChart from "../components/CandidatesChart";
import ResultsTable from "../components/ResultsTable";
import CandidateDrawer from "../components/CandidateDrawer";
import LoadingSkeleton from "../components/LoadingSkeleton";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [resumeFiles, setResumeFiles] = useState([]);
  const [jdFile, setJdFile] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [error, setError] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [topOnly, setTopOnly] = useState(false);

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      if (skillFilter && !item.matched_skills.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase()))) {
        return false;
      }
      if (topOnly) {
        return item.ats_score >= 80;
      }
      return true;
    });
  }, [results, skillFilter, topOnly]);

  const stats = useMemo(() => {
    const average = results.length ? Math.round(results.reduce((sum, item) => sum + item.ats_score, 0) / results.length) : 0;
    const topCandidate = results[0]?.candidate_name || "None yet";
    const matchedSignals = results.reduce((sum, item) => sum + item.matched_skills.length, 0);
    return { average, topCandidate, matchedSignals };
  }, [results]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await screeningApi.getResults();
        const nextResults = Array.isArray(data) ? data : [];
        setResults(nextResults);
        if (nextResults[0]) {
          setSelectedCandidateId(nextResults[0].id);
        }
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load results."));
      }
    };

    fetchResults();
  }, []);

  useEffect(() => {
    if (!selectedCandidateId) {
      setSelectedCandidate(null);
      return;
    }

    const loadCandidate = async () => {
      setInsightLoading(true);
      try {
        const { data } = await screeningApi.getCandidate(selectedCandidateId);
        setSelectedCandidate(data);
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load candidate details."));
      } finally {
        setInsightLoading(false);
      }
    };

    loadCandidate();
  }, [selectedCandidateId]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim() && jdFile.length === 0) {
      setError("Add a job description or upload a JD PDF.");
      return;
    }
    if (resumeFiles.length === 0) {
      setError("Upload at least one resume PDF.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data } = await screeningApi.analyze({
        jobDescription,
        resumes: resumeFiles,
        jdFile: jdFile[0],
      });
      const nextResults = Array.isArray(data?.results) ? data.results : [];
      setResults(nextResults);
      if (nextResults[0]) {
        setSelectedCandidateId(nextResults[0].id);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Analysis failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await screeningApi.exportResults();
      downloadBlob(data, "resume-screening-results.csv");
    } catch (err) {
      setError(getErrorMessage(err, "Export failed."));
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-brand-600 dark:text-brand-400">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">AI Resume Screening System</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              Recruiter workspace for {user?.name || "your team"}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button onClick={handleExport} className="glass-panel flex items-center gap-2 px-4 py-2 text-sm">
              <Download size={16} />
              Export CSV
            </button>
            <button onClick={logout} className="glass-panel flex items-center gap-2 px-4 py-2 text-sm">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </motion.header>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Average ATS score" value={stats.average} hint="Across all analyzed resumes" />
              <StatCard label="Top candidate" value={stats.topCandidate} hint="Highest ATS fit right now" />
              <StatCard label="Matched signals" value={stats.matchedSignals} hint="Direct skill hits detected" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <DropZone
                title="Upload resumes"
                helper="Drag and drop candidate PDFs. Upload multiple files for ranking."
                files={resumeFiles}
                onFileChange={setResumeFiles}
              />
              <DropZone
                title="Upload job description"
                helper="Optional JD PDF. If provided, it overrides the text area below."
                files={jdFile}
                onFileChange={setJdFile}
                multiple={false}
              />
            </div>

            <div className="glass-panel p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-300">Job description</p>
                  <h2 className="text-xl font-semibold">Paste the role requirements</h2>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-brand-500 dark:text-slate-950"
                >
                  {loading ? "Analyzing..." : "Analyze resumes"}
                </button>
              </div>
              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Example: Looking for a full-stack engineer with React, FastAPI, MongoDB, JWT, testing, and cloud deployment experience..."
                className="mt-4 min-h-56 w-full rounded-3xl border border-slate-200 bg-white p-4 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-white/5"
              />
              {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
            </div>

            {results.length ? <CandidatesChart data={filteredResults.slice(0, 8)} /> : <LoadingSkeleton />}
          </div>

          <div className="min-h-[720px]">
            {insightLoading ? <LoadingSkeleton /> : <CandidateDrawer candidate={selectedCandidate} onClose={() => setSelectedCandidateId("")} />}
          </div>
        </section>

        <section className="space-y-4">
          <div className="glass-panel flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-300">Candidate ranking</p>
              <h2 className="text-xl font-semibold">Shortlist and filter talent</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
                <Search size={16} />
                <input
                  value={skillFilter}
                  onChange={(event) => setSkillFilter(event.target.value)}
                  placeholder="Filter by skill"
                  className="bg-transparent outline-none"
                />
              </label>
              <button
                onClick={() => setTopOnly((current) => !current)}
                className={`rounded-2xl px-4 py-3 text-sm ${topOnly ? "bg-brand-500 text-slate-950" : "border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}
              >
                <span className="inline-flex items-center gap-2">
                  <Filter size={16} />
                  Top candidates
                </span>
              </button>
            </div>
          </div>

          {filteredResults.length ? (
            <ResultsTable results={filteredResults} selectedId={selectedCandidateId} onSelect={setSelectedCandidateId} />
          ) : (
            <div className="glass-panel p-8 text-center text-sm text-slate-500 dark:text-slate-300">
              Analyze resumes to populate the ranking table.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
