import { useEffect, useState } from "react";
import { AskForm } from "./components/AskForm";
import { TraceView } from "./components/TraceView";
import { LoginForm } from "./components/LoginForm";
import { SignupForm } from "./components/SignupForm";
import { askAgent, API_BASE } from "./lib/api";
import { useAuth } from "./context/AuthContext";
import type { TraceStep } from "./lib/types";

type HealthStatus = "checking" | "ok" | "error";

function App() {
  const { token, user, loading: authLoading, logout } = useAuth();
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [health, setHealth] = useState<HealthStatus>("checking");
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => setHealth(data.status === "ok" ? "ok" : "error"))
      .catch(() => setHealth("error"));
  }, []);

  // Clear any stale trace/error from a previous session on login/logout.
  useEffect(() => {
    setTrace([]);
    setError(null);
  }, [token]);

  async function handleAsk(question: string) {
    if (!token) return;
    setLoading(true);
    setError(null);
    setTrace([]);
    try {
      const { trace } = await askAgent(question, token);
      setTrace(trace);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        {authView === "login" ? (
          <LoginForm onToggle={() => setAuthView("signup")} />
        ) : (
          <SignupForm onToggle={() => setAuthView("login")} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Signal</h1>
          <div className="flex items-center gap-4">
            <span
              className={
                health === "ok"
                  ? "font-mono text-xs text-emerald-400"
                  : health === "error"
                    ? "font-mono text-xs text-red-400"
                    : "font-mono text-xs text-slate-500"
              }
            >
              server: {health}
            </span>
            <span className="text-xs text-slate-500">{user.email}</span>
            <button onClick={logout} className="text-xs text-sky-400 hover:underline">
              Log out
            </button>
          </div>
        </div>

        <p className="mb-6 text-slate-400">
          Ask a question about Hacker News "Who is hiring" postings — the agent writes its
          own SQL and picks a chart.
        </p>

        <AskForm onSubmit={handleAsk} loading={loading} />

        {error && (
          <div
            data-testid="error-banner"
            className="mt-4 rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {loading && <p className="mt-6 animate-pulse text-sm text-slate-500">Agent is thinking…</p>}

        {trace.length > 0 && (
          <div className="mt-6">
            <TraceView trace={trace} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
