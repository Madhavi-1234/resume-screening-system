import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";
import AuthCard from "../components/AuthCard";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/errors";
import { useTheme } from "../hooks/useTheme";

export default function AuthPage() {
  const navigate = useNavigate();
  const { persistAuth, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [navigate, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const action = mode === "login" ? authApi.login : authApi.signup;
      const payload = mode === "login" ? { email: form.email, password: form.password } : form;
      const { data } = await action(payload);
      if (!data?.access_token || !data?.user) {
        throw new Error("Authentication response is missing required fields.");
      }
      persistAuth(data);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err, "Authentication failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen overflow-hidden lg:grid-cols-[1.1fr_0.9fr]">
      <section className="grid-bg relative hidden p-12 lg:block">
        <div className="absolute right-8 top-8">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <div className="flex h-full max-w-xl flex-col justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-brand-600 dark:text-brand-400">Recruiting intelligence</p>
            <h2 className="mt-5 text-5xl font-semibold leading-tight text-slate-950 dark:text-white">
              Rank talent in minutes with ATS-grade AI screening.
            </h2>
            <p className="mt-6 max-w-lg text-lg text-slate-600 dark:text-slate-300">
              Upload resumes, compare them with the job description, inspect missing skills, and export recruiter-ready shortlists.
            </p>
          </div>
          <div className="glass-panel max-w-lg p-6">
            <p className="text-sm text-slate-500 dark:text-slate-300">Built for modern hiring teams</p>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-2xl font-semibold">100%</p><p className="mt-1 text-slate-500">JWT secured</p></div>
              <div><p className="text-2xl font-semibold">ATS</p><p className="mt-1 text-slate-500">Score + explain</p></div>
              <div><p className="text-2xl font-semibold">CSV</p><p className="mt-1 text-slate-500">One-click export</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 lg:p-12">
        <div className="absolute right-6 top-6 lg:hidden">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <AuthCard
          mode={mode}
          form={form}
          setForm={setForm}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onModeChange={() => setMode((current) => (current === "login" ? "signup" : "login"))}
        />
      </section>
    </div>
  );
}
