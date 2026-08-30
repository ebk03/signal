import { useEffect, useState } from "react";
import type { TraceStep } from "../lib/types";
import { Chart } from "./Chart";

interface TraceViewProps {
  trace: TraceStep[];
}

const REASONING_TYPES = new Set(["sql", "result", "error"]);

export function TraceView({ trace }: TraceViewProps) {
  const [showReasoning, setShowReasoning] = useState(false);

  useEffect(() => {
    const hasAnswer = trace.some((step) => step.type === "text" || step.type === "chart");
    const hasReasoning = trace.some((step) => REASONING_TYPES.has(step.type));
    // If the agent never produced a final answer (e.g. it errored out every
    // turn), show the reasoning trace by default — it's the only
    // information the user has to go on.
    setShowReasoning(!hasAnswer && hasReasoning);
  }, [trace]);

  const answerSteps = trace.filter((step) => step.type === "text" || step.type === "chart");
  const reasoningSteps = trace.filter((step) => REASONING_TYPES.has(step.type));

  return (
    <div className="flex flex-col gap-8">
      {answerSteps.map((step, i) => (
        <TraceStepView key={i} step={step} />
      ))}

      {reasoningSteps.length > 0 && (
        <div className="border-t border-line pt-6">
          <button
            onClick={() => setShowReasoning((v) => !v)}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-muted hover:text-fg"
          >
            <span>{showReasoning ? "▾" : "▸"}</span>
            {showReasoning ? "Hide reasoning" : "Show reasoning"}
          </button>

          {showReasoning && (
            <div className="mt-6 flex flex-col gap-8">
              {reasoningSteps.map((step, i) => (
                <TraceStepView key={i} step={step} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TraceStepView({ step }: { step: TraceStep }) {
  switch (step.type) {
    case "sql":
      return (
        <div className="border-b border-line pb-8">
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted">Query</p>
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-fg">
            <code>{step.query}</code>
          </pre>
        </div>
      );
    case "result":
      return <ResultTable rows={step.rows} rowCount={step.rowCount} />;
    case "error":
      return (
        <div className="border-b border-line pb-8 text-sm text-red-400">{step.message}</div>
      );
    case "text":
      return <p className="border-b border-line pb-8 font-display text-lg text-fg/90">{step.text}</p>;
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
      <div className="border-b border-line pb-8 text-sm text-muted">Query returned no rows.</div>
    );
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="border-b border-line pb-8">
      <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted">
        {rowCount} row{rowCount === 1 ? "" : "s"}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-2 py-1 font-mono text-xs font-medium uppercase tracking-wide text-muted"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 20).map((row, i) => (
              <tr key={i} className="border-b border-line/50 text-fg">
                {columns.map((col) => (
                  <td key={col} className="px-2 py-1.5">
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
