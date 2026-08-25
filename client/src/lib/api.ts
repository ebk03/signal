import type { AskResponse } from "./types";

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

export async function askAgent(question: string): Promise<AskResponse> {
  const res = await fetch(`${API_BASE}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed with status ${res.status}`);
  }

  return res.json();
}
