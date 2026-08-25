import { useEffect, useState } from "react";
import type { TraceStep } from "../lib/types";
import { Chart } from "./Chart";

interface TraceViewProps {
  trace: TraceStep[];
}

export function TraceView({ trace }: TraceViewProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    if (trace.length === 0) return;
    const timers = trace.map((_, i) =>
      setTimeout(() => setVisibleCount((c) => Math.max(c, i + 1)), i * 500),
    );
    return () => timers.forEach(clearTimeout);
  }, [trace]);

  return (
    <div className="flex flex-col gap-4">
      {trace.slice(0, visibleCount).map((step, i) => (
        <TraceStepView key={i} step={step} />
      ))}
    </div>
  );
}

function TraceStepView({ step }: { step: TraceStep }) {
  switch (step.type) {
    case "sql":
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-950 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Query
          </p>
          <pre className="overflow-x-auto text-sm text-emerald-300">
            <code>{step.query}</code>
          </pre>
        </div>
      );
    case "result":
      return <ResultTable rows={step.rows} rowCount={step.rowCount} />;
    case "error":
      return (
        <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-300">
          {step.message}
        </div>
      );
    case "text":
      return <p className="text-slate-300">{step.text}</p>;
    case "chart":
      return <Chart chartType={step.chartType} title={step.title} data={step.data} />;
  }
}

function ResultTable({
  rows,
  rowCount,
}: {
  rows: Record<string, unknown>[];
  rowCount: number;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 text-sm text-slate-400">
        Query returned no rows.
      </div>
    );
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {rowCount} row{rowCount === 1 ? "" : "s"}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              {columns.map((col) => (
                <th key={col} className="px-2 py-1 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 20).map((row, i) => (
              <tr key={i} className="border-b border-slate-800 text-slate-200">
                {columns.map((col) => (
                  <td key={col} className="px-2 py-1">
                    {String(row[col] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
