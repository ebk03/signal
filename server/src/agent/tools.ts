import type Anthropic from "@anthropic-ai/sdk";

export const AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: "run_sql_query",
    description:
      "Execute a single read-only PostgreSQL SELECT statement against the job_postings table and return the resulting rows. Only SELECT (or WITH ... SELECT) statements are permitted — no writes.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "A single PostgreSQL SELECT statement.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "render_chart",
    description:
      "Render the final answer as a chart for the user. Call this exactly once, after you have the data you need from run_sql_query.",
    input_schema: {
      type: "object",
      properties: {
        chartType: {
          type: "string",
          enum: ["bar", "line", "pie"],
          description: "The chart type best suited to the data.",
        },
        title: {
          type: "string",
          description: "A short, human-readable title for the chart.",
        },
        data: {
          type: "array",
          description: "The data points to plot.",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              value: { type: "number" },
            },
            required: ["label", "value"],
          },
        },
      },
      required: ["chartType", "title", "data"],
    },
  },
];
