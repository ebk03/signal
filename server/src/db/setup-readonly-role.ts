import "dotenv/config";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — check server/.env");
}

const password = process.argv[2];
if (!password) {
  throw new Error("Usage: tsx src/db/setup-readonly-role.ts <password>");
}

const sql = postgres(connectionString, { ssl: "require" });

async function run() {
  const dbName = new URL(connectionString!).pathname.replace(/^\//, "");

  const [{ exists }] = await sql`
    SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'agent_readonly') AS exists
  `;

  if (exists) {
    await sql`ALTER ROLE agent_readonly WITH LOGIN PASSWORD ${password}`;
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

  await sql.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
