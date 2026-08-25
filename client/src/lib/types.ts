export type ChartType = "bar" | "line" | "pie";

export interface ChartDataPoint {
  label: string;
  value: number;
}

export type TraceStep =
  | { type: "sql"; query: string }
  | { type: "result"; rows: Record<string, unknown>[]; rowCount: number }
  | { type: "error"; message: string }
  | { type: "chart"; chartType: ChartType; title: string; data: ChartDataPoint[] }
  | { type: "text"; text: string };

export interface AskResponse {
  trace: TraceStep[];
}

export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface DashboardStats {
  totalPostings: number;
  lastScrapedAt: string | null;
  skills: ChartDataPoint[];
}
