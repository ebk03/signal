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
      <p className="mb-6 text-slate-400">
        Skill demand across Hacker News "Who is hiring" postings, updated whenever the
        dataset is refreshed.
      </p>

      {!isLoggedIn && (
        <div className="mb-6 flex flex-col items-start gap-3 rounded-lg border border-sky-800 bg-sky-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-200">
            Want to ask your own questions about this data? Log in to chat with the agent.
          </p>
          <button
            onClick={onLoginClick}
            className="shrink-0 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-400"
          >
            Log in to ask your own questions
          </button>
        </div>
      )}

      {error && (
        <div
          data-testid="error-banner"
          className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {!error && !stats && (
        <p className="animate-pulse text-sm text-slate-500">Loading dashboard…</p>
      )}

      {stats && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total postings</p>
              <p className="mt-1 text-2xl font-semibold text-slate-100">{stats.totalPostings}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Last scraped</p>
              <p className="mt-1 text-2xl font-semibold text-slate-100">
                {stats.lastScrapedAt ? new Date(stats.lastScrapedAt).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          <Chart chartType="bar" title="Most In-Demand Skills" data={stats.skills} />
        </>
      )}
    </div>
  );
}
