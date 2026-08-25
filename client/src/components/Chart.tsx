import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint, ChartType } from "../lib/types";

const COLORS = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#818cf8", "#f472b6"];

interface ChartProps {
  chartType: ChartType;
  title: string;
  data: ChartDataPoint[];
}

export function Chart({ chartType, title, data }: ChartProps) {
  return (
    <div data-testid="chart" className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <h3 className="mb-3 text-sm font-medium text-slate-300">{title}</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0" }}
              />
              <Bar dataKey="value" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : chartType === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0" }}
              />
              <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} />
            </LineChart>
          ) : (
            <PieChart>
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0" }}
              />
              <Pie data={data} dataKey="value" nameKey="label" outerRadius={100} label>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
