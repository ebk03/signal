import "dotenv/config";
import postgres from "postgres";

const connectionString = process.env.AGENT_DATABASE_URL;
if (!connectionString) {
  throw new Error("AGENT_DATABASE_URL is not set — check server/.env");
}

// Uses the agent_readonly role (see src/db/setup-readonly-role.ts): it holds
// only SELECT on job_postings, so this connection cannot write no matter
// what SQL text it's asked to run. Shared by the agent and by any other
// read-only route (e.g. the public dashboard) that has no business
// touching the owner-privileged DATABASE_URL connection.
const client = postgres(connectionString, { ssl: "require", max: 5 });

export async function runReadOnlyQuery(query: string): Promise<Record<string, unknown>[]> {
  const rows = await client.unsafe(query);
  return rows as unknown as Record<string, unknown>[];
}
