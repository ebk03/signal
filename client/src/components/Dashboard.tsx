import { useEffect, useState } from "react";
import { fetchDashboardStats } from "../lib/api";
import { Chart } from "./Chart";
import type { DashboardStats } from "../lib/types";

interface DashboardProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

export function Dashboard({ isLoggedIn, onLoginClick }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong."));
  }, []);

  return (
    <div>
      <p className="mb-12 max-w-xl font-display text-xl leading-snug text-fg/90">
        Skill demand across Hacker News "Who is hiring" postings, updated whenever the
        dataset is refreshed.
      </p>

      {stats && (
        <div className="mb-12 flex flex-wrap gap-x-16 gap-y-6 border-b border-line pb-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-muted">
              Total postings
            </p>
            <p className="mt-1 font-display text-4xl text-fg">{stats.totalPostings}</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-muted">
              Last scraped
            </p>
            <p className="mt-1 font-display text-4xl text-fg">
              {stats.lastScrapedAt ? new Date(stats.lastScrapedAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
      )}

      {!isLoggedIn && (
        <div className="mb-12 flex flex-col items-start gap-4 border-b border-line pb-12 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-fg/80">
            Want to ask your own questions about this data? Log in to chat with the agent.
          </p>
          <button
            onClick={onLoginClick}
            className="shrink-0 rounded-full bg-accent px-5 py-2 text-sm font-medium text-fg transition-opacity hover:opacity-90"
          >
            Log in to ask your own questions
          </button>
        </div>
      )}

      {error && (
        <div data-testid="error-banner" className="border-b border-line pb-8 text-sm text-red-400">
          {error}
        </div>
      )}

      {!error && !stats && (
        <p className="animate-pulse text-sm text-muted">Loading dashboard…</p>
      )}

      {stats && <Chart chartType="bar" title="Most In-Demand Skills" data={stats.skills} />}
    </div>
  );
}
