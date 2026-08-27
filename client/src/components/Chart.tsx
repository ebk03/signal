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

const VIBRANT_COLORS = [
  "#8b5cf6", // violet
  "#38bdf8", // sky
  "#f472b6", // pink
  "#2dd4bf", // teal
  "#fbbf24", // amber
  "#a3e635", // lime
  "#fb7185", // rose
  "#60a5fa", // blue
];

interface ChartProps {
  chartType: ChartType;
  title: string;
  data: ChartDataPoint[];
}

export function Chart({ chartType, title, data }: ChartProps) {
  return (
    <div data-testid="chart">
      <p className="mb-3 font-mono text-xs uppercase tracking-wide text-muted">{title}</p>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--color-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "var(--color-line)" }}
              />
              <YAxis stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-line)",
                  color: "var(--color-fg)",
                }}
              />
              <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                {data.map((_, i) => (
                  <Cell key={i} fill={VIBRANT_COLORS[i % VIBRANT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : chartType === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--color-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "var(--color-line)" }}
              />
              <YAxis stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-line)",
                  color: "var(--color-fg)",
                }}
              />
              <Line type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
            </LineChart>
          ) : (
            <PieChart>
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-line)",
                  color: "var(--color-fg)",
                }}
              />
              <Pie data={data} dataKey="value" nameKey="label" outerRadius={100} label>
                {data.map((_, i) => (
                  <Cell key={i} fill={VIBRANT_COLORS[i % VIBRANT_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
