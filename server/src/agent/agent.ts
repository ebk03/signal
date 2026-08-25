import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { AGENT_TOOLS } from "./tools.js";
import { assertReadOnlySelect, enforceLimit } from "./sqlGuard.js";
import { runReadOnlyQuery } from "./dbReadOnly.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-5";
const MAX_TURNS = 6;

const SYSTEM_PROMPT = `You are a data analyst agent for "Signal", a tool that answers questions about internship/job postings scraped from Hacker News "Who is hiring" threads.

You have access to one PostgreSQL table, job_postings, with these columns:
- id (integer)
- hn_item_id (integer) — the HN comment id
- hn_thread_id (integer) — the HN thread id (one thread per month)
- company (text, nullable) — best-effort extracted, often null
- role (text, nullable) — best-effort extracted, often null
- skills (text[]) — array of detected technology keywords, e.g. 'TypeScript', 'AWS'. This is the most reliably populated field.
- location (text, nullable)
- remote (boolean)
- raw_text (text) — the full original HN comment, always present
- posted_at (timestamp) — when the thread was posted (proxy for "posting date")
- scraped_at (timestamp)

Rules:
- Only call run_sql_query with a single SELECT (or WITH ... SELECT) statement. No other SQL is permitted — it will be rejected.
- company/role/location can be null since extraction is heuristic. Filter those out when it would skew an aggregate (e.g. WHERE company IS NOT NULL).
- To analyze skills, use unnest(skills) to expand the array before grouping/counting.
- Once you have the data you need, call render_chart exactly once to present the answer, choosing whichever chart type (bar/line/pie) fits the question.
- Prefer a small number of focused queries over one sprawling query.`;

export type TraceStep =
  | { type: "sql"; query: string }
  | { type: "result"; rows: Record<string, unknown>[]; rowCount: number }
  | { type: "error"; message: string }
  | { type: "chart"; chartType: "bar" | "line" | "pie"; title: string; data: { label: string; value: number }[] }
  | { type: "text"; text: string };

export async function runAgent(question: string): Promise<TraceStep[]> {
  const trace: TraceStep[] = [];
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: question }];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: AGENT_TOOLS,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    for (const block of response.content) {
      if (block.type === "text" && block.text.trim()) {
        trace.push({ type: "text", text: block.text });
      }
    }

    const toolUses = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );

    if (toolUses.length === 0) {
      break;
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    let chartRendered = false;

    for (const toolUse of toolUses) {
      if (toolUse.name === "run_sql_query") {
        const { query } = toolUse.input as { query: string };
        trace.push({ type: "sql", query });

        try {
          assertReadOnlySelect(query);
          const safeQuery = enforceLimit(query);
          const rows = await runReadOnlyQuery(safeQuery);
          trace.push({ type: "result", rows, rowCount: rows.length });
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: JSON.stringify(rows.slice(0, 200)),
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          trace.push({ type: "error", message });
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: `Error: ${message}`,
            is_error: true,
          });
        }
      } else if (toolUse.name === "render_chart") {
        const chart = toolUse.input as {
          chartType: "bar" | "line" | "pie";
          title: string;
          data: { label: string; value: number }[];
        };
        trace.push({ type: "chart", ...chart });
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: "Chart rendered.",
        });
        chartRendered = true;
      }
    }

    if (chartRendered) {
      break;
    }

    messages.push({ role: "user", content: toolResults });
  }

  return trace;
}
