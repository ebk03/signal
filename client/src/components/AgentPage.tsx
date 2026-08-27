import { useEffect, useState } from "react";
import { AskForm } from "./AskForm";
import { TraceView } from "./TraceView";
import { askAgent } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { TraceStep } from "../lib/types";

export function AgentPage() {
  const { token } = useAuth();
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <p className="mb-12 max-w-xl font-display text-xl leading-snug text-fg/90">
        Ask a question about Hacker News "Who is hiring" postings — the agent writes its
        own SQL and picks a chart.
      </p>

      <AskForm onSubmit={handleAsk} loading={loading} />

      {error && (
        <div data-testid="error-banner" className="mt-8 border-b border-line pb-8 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && <p className="mt-8 animate-pulse text-sm text-muted">Agent is thinking…</p>}

      {trace.length > 0 && (
        <div className="mt-10">
          <TraceView trace={trace} />
        </div>
      )}
    </div>
  );
}
