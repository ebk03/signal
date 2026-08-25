import { useEffect, useState } from "react";
import { LoginForm } from "./components/LoginForm";
import { SignupForm } from "./components/SignupForm";
import { Dashboard } from "./components/Dashboard";
import { AgentPage } from "./components/AgentPage";
import { API_BASE } from "./lib/api";
import { useAuth } from "./context/AuthContext";

type HealthStatus = "checking" | "ok" | "error";
type View = "dashboard" | "ask" | "login" | "signup";

function App() {
  const { token, user, loading: authLoading, logout } = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const [health, setHealth] = useState<HealthStatus>("checking");

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => setHealth(data.status === "ok" ? "ok" : "error"))
      .catch(() => setHealth("error"));
  }, []);

  if (authLoading) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  const isLoggedIn = Boolean(token && user);

  if (!isLoggedIn && (view === "login" || view === "signup")) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <div className="mx-auto max-w-3xl px-4 pt-6">
          <button
            onClick={() => setView("dashboard")}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            ← Back to dashboard
          </button>
        </div>
        {view === "login" ? (
          <LoginForm onToggle={() => setView("signup")} />
        ) : (
          <SignupForm onToggle={() => setView("login")} />
        )}
      </div>
    );
  }

  const healthClass =
    health === "ok"
      ? "font-mono text-xs text-emerald-400"
      : health === "error"
        ? "font-mono text-xs text-red-400"
        : "font-mono text-xs text-slate-500";

  const navButtonClass = (active: boolean) =>
    active
      ? "rounded-md bg-slate-800 px-3 py-1 text-sm text-slate-100"
      : "rounded-md px-3 py-1 text-sm text-slate-400 hover:text-slate-200";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-semibold">Signal</h1>
            {isLoggedIn && (
              <nav className="flex gap-1">
                <button onClick={() => setView("dashboard")} className={navButtonClass(view === "dashboard")}>
                  Dashboard
                </button>
                <button onClick={() => setView("ask")} className={navButtonClass(view === "ask")}>
                  Ask Agent
                </button>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className={healthClass}>server: {health}</span>
            {isLoggedIn ? (
              <>
                <span className="text-xs text-slate-500">{user!.email}</span>
                <button onClick={logout} className="text-xs text-sky-400 hover:underline">
                  Log out
                </button>
              </>
            ) : (
              <button
                onClick={() => setView("login")}
                className="rounded-lg bg-sky-500 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-sky-400"
              >
                Log in
              </button>
            )}
          </div>
        </div>

        {view === "ask" && isLoggedIn ? (
          <AgentPage />
        ) : (
          <Dashboard isLoggedIn={isLoggedIn} onLoginClick={() => setView("login")} />
        )}
      </div>
    </div>
  );
}

export default App;
