import "dotenv/config";
import crypto from "node:crypto";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — check server/.env");
}

// Optionally pass a password as an argument to reuse an existing one
// (e.g. when rotating); otherwise a fresh one is generated automatically.
const password = process.argv[2] ?? crypto.randomBytes(18).toString("base64url");

const sql = postgres(connectionString, { ssl: "require" });

async function run() {
  const dbName = new URL(connectionString!).pathname.replace(/^\//, "");

  const [{ exists }] = await sql`
    SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'agent_readonly') AS exists
  `;

  if (exists) {
    // Postgres doesn't support bind parameters in ALTER ROLE ... PASSWORD —
    // it needs a literal, same as CREATE ROLE below.
    await sql.unsafe(`ALTER ROLE agent_readonly WITH LOGIN PASSWORD '${password}'`);
    console.log("Role agent_readonly already existed — password updated.");
  } else {
    await sql.unsafe(`CREATE ROLE agent_readonly WITH LOGIN PASSWORD '${password}'`);
    console.log("Created role agent_readonly.");
  }

  await sql.unsafe(`GRANT CONNECT ON DATABASE ${dbName} TO agent_readonly`);
  await sql`GRANT USAGE ON SCHEMA public TO agent_readonly`;
  await sql`GRANT SELECT ON job_postings TO agent_readonly`;
  await sql`ALTER ROLE agent_readonly SET statement_timeout = '5s'`;

  console.log("Grants applied: CONNECT, USAGE on schema public, SELECT on job_postings.");
  console.log("statement_timeout set to 5s for agent_readonly.");

  const agentUrl = new URL(connectionString!);
  agentUrl.username = "agent_readonly";
  agentUrl.password = password;

  console.log("\nAdd this line to server/.env:\n");
  console.log(`AGENT_DATABASE_URL=${agentUrl.toString()}`);

  await sql.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
