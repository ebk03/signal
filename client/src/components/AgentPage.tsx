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
  );
}
