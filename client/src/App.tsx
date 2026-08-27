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
    return <div className="min-h-screen bg-canvas" />;
  }

  const isLoggedIn = Boolean(token && user);

  if (!isLoggedIn && (view === "login" || view === "signup")) {
    return (
      <div className="min-h-screen bg-canvas text-fg">
        <div className="mx-auto max-w-3xl px-4 pt-6">
          <button onClick={() => setView("dashboard")} className="text-sm text-muted hover:text-fg">
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

  const showAgentPage = view === "ask" && isLoggedIn;

  const healthClass =
    health === "ok"
      ? "font-mono text-xs text-fg/60"
      : health === "error"
        ? "font-mono text-xs text-red-400"
        : "font-mono text-xs text-muted";

  const navButtonClass = (active: boolean) =>
    active ? "px-3 py-1 text-sm text-fg" : "px-3 py-1 text-sm text-muted hover:text-fg";

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-12 flex items-center justify-between border-b border-line pb-6">
          <div className="flex items-center gap-6">
            <h1 className="font-display text-2xl text-fg">Signal</h1>
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
                <span className="font-mono text-xs text-muted">{user!.email}</span>
                <button
                  onClick={logout}
                  className="text-xs text-fg underline decoration-line underline-offset-4 hover:decoration-fg"
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                onClick={() => setView("login")}
                className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-fg transition-opacity hover:opacity-90"
              >
                Log in
              </button>
            )}
          </div>
        </div>

        {showAgentPage ? (
          <AgentPage />
        ) : (
          <Dashboard isLoggedIn={isLoggedIn} onLoginClick={() => setView("login")} />
        )}
      </div>
    </div>
  );
}

export default App;
