# Signal

**An AI agent that answers questions about the job market by writing its own SQL — not a fixed set of queries.**

**Live demo:** https://dr18b4ljdz2lr.cloudfront.net

## What this is

Signal scrapes Hacker News "Who is hiring?" threads into Postgres, then lets you ask natural-language questions about the data — "what's the most in-demand skill this month?", "which companies are hiring for remote React roles?" — and watches an LLM agent decide what SQL to write, run it, and pick a chart to visualize the result.

It exists because internship/job hunting generates exactly this kind of messy, semi-structured data (hundreds of freeform hiring comments) that's genuinely useful to query but painful to query by hand. The interesting part isn't the scraping or the dashboard — it's that the agent has real agency over the query and the visualization. There's no hardcoded map of question → SQL template; the model reads a schema description, decides what to run via tool-calling, and can iterate (run a query, look at the result, refine) before rendering a chart. Safety for that comes from two independent layers — a database role that's physically incapable of writing, plus application-level validation — rather than trusting the model's output alone.

A public dashboard (no login) shows live skill-demand stats; asking your own questions requires a free account.

## Tech stack

- **Language:** TypeScript end-to-end
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Fastify
- **Database:** PostgreSQL (hosted on [Neon](https://neon.tech)) + Drizzle ORM
- **Agent:** Anthropic API (Claude), tool-calling
- **Auth:** JWT (signup/login, bcryptjs password hashing)
- **Testing:** Jest (unit) + Playwright (e2e)
- **Deployment:** AWS (Lambda + API Gateway for the API, S3 + CloudFront for the frontend), provisioned via CDK

## Prerequisites

- Node.js 24.x (what this was actually built and tested on — untested on other majors)
- A free [Neon](https://neon.tech) Postgres project
- A free [Anthropic API key](https://console.anthropic.com) with a little credit added (each question costs a small amount)

## Setup

### 1. Clone and install

This is an npm workspaces monorepo (`client` + `server`) — one install at the root covers both:

```bash
git clone https://github.com/ebk03/signal.git
cd signal
npm install
```

### 2. Environment variables

Copy the example files and fill them in:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**`server/.env`** — all four of the first group are required, the rest are optional with sensible local defaults:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon connection string, owner role (used for migrations and the scraper) |
| `AGENT_DATABASE_URL` | Yes | Connection string for the `agent_readonly` role — see step 4 below |
| `ANTHROPIC_API_KEY` | Yes | From console.anthropic.com |
| `JWT_SECRET` | Yes | Random string — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `PORT` | No | API server port, defaults to `3001` |
| `CLIENT_ORIGIN` | No | For CORS, defaults to `http://localhost:5173` |

**`client/.env`**:

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No | Defaults to `http://localhost:3001` |

### 3. Run the database migration

```bash
npm run db:migrate --workspace=server
```

This creates the `job_postings` and `users` tables in your Neon database.

### 4. Set up the read-only agent role

The agent connects through a dedicated `agent_readonly` Postgres role that can only `SELECT` from `job_postings` — it's physically incapable of writing, independent of any application-level checks. This script creates it (or rotates its password if it already exists), generating a secure password automatically:

```bash
cd server
npx tsx src/db/setup-readonly-role.ts
```

It prints the exact line to paste into `server/.env`, e.g.:

```
AGENT_DATABASE_URL=postgresql://agent_readonly:<generated-password>@<your-neon-host>/neondb?sslmode=require
```

Copy that line in directly — it's already assembled from your `DATABASE_URL`'s host/port/database, just with the role and password swapped.

### 5. Populate real data

```bash
npm run scrape --workspace=server
```

This hits Hacker News' live Algolia API and pulls the current "Who is hiring?" thread — real network activity, not a fixture. Safe to re-run; it dedupes on the HN comment ID.

### 6. Start both dev servers

```bash
npm run dev:server
npm run dev:client
```

| Service | URL |
|---|---|
| API (Fastify) | http://localhost:3001 |
| Frontend (Vite) | http://localhost:5173 |

Open the frontend URL — you'll land on the public dashboard. Sign up to unlock the agent chat.

## Running tests

**Unit tests** (Jest — `sqlGuard`, scraper parsing/skill extraction):

```bash
npm run test --workspace=server
```

**End-to-end test** (Playwright — full signup → ask a question → chart renders flow):

```bash
# first time only — installs the browser binary
cd client && npx playwright install chromium && cd ..

npm run test:e2e --workspace=client
```

⚠️ The e2e test exercises the *real* Anthropic API and your real database — no mocking. Each run costs a small amount and takes ~10 seconds. Don't wire it into a CI pipeline that runs on every push without knowing that.

## Deployment

Backend runs on Lambda behind an API Gateway HTTP API (no Docker — `aws-cdk-lib`'s `NodejsFunction` bundles with esbuild, which is exactly why `bcryptjs` was chosen over native `bcrypt` back when auth was built). Frontend is a static build on S3 behind CloudFront. Both are provisioned via CDK in `infra/`, added as a third npm workspace.

**Why Lambda over ECS Fargate/App Runner:** no Docker needed at all (this machine didn't have it installed, and CDK's container-based bundling would have required it), the dependency choices already assumed Lambda, and true pay-per-request pricing suits a portfolio project's sporadic traffic. The honest tradeoff: `@fastify/rate-limit`'s in-memory store means the per-user limit is really per-warm-container under concurrent Lambda invocations, not strictly global — acceptable for a demo, not for real adversarial traffic.

### Deploy order

The two stacks have a real chicken-and-egg dependency: the backend's CORS config needs the frontend's CloudFront domain (resolved automatically via a CDK cross-stack reference, regardless of order), but the frontend's static JS bundle needs the backend's API URL *baked in at build time*, before those files even exist for upload. That's not something CDK can sequence on its own — it takes an actual rebuild in between:

```bash
# Load the same secrets from server/.env into your shell — CDK reads
# process.env directly, it doesn't read .env files
cd server && set -a && source <(grep -v '^#' .env | grep -v '^$') && set +a && cd ..

# One-time per AWS account/region
cd infra && npx cdk bootstrap aws://<account-id>/<region> && cd ..

# 1. Frontend shell (S3 + CloudFront) — content doesn't matter yet
npm run build --workspace=client
cd infra && npx cdk deploy SignalFrontendStack --require-approval never && cd ..
# note the DistributionDomain output

# 2. Backend — its CORS origin references the frontend stack directly in code
cd infra && npx cdk deploy SignalBackendStack --require-approval never && cd ..
# note the ApiUrl output

# 3. Rebuild the client with the real API URL, then push the real content
VITE_API_BASE_URL=<api-url-from-step-2> npm run build --workspace=client
cd infra && npx cdk deploy SignalFrontendStack --require-approval never && cd ..
```

### Debugging a live issue

Tail the Lambda's logs directly instead of redeploying blind:

```bash
aws logs tail /aws/lambda/signal-api --follow
```

(Drop `--follow` and add `--since 1h` to just review recent history instead of streaming live.)

### Before a live demo

Lambda cold starts after ~5–15 minutes of idle — the first request re-runs Fastify's full plugin registration and feels noticeably slower. Warm it up right before you demo:

```bash
curl https://<your-api-url>/health
```

One throwaway request is enough; the container stays warm for the next several minutes.

## Architecture / design decisions

**Two tools, not one.** The agent has `run_sql_query` and `render_chart` — giving it both, rather than us guessing a chart type after the fact, is what makes this real agency: the model decides the query *and* the visualization, and can loop before rendering.

**Defense in depth on SQL safety.** A dedicated `agent_readonly` database role (`SELECT`-only, no grant on the `users` table at all) is the real backstop — it can't write no matter what the model asks it to run. On top of that, app-level validation (`sqlGuard.ts`) rejects multi-statement or non-`SELECT` queries before they even reach the network. Neither layer depends on the other being correct.

**JWT in an `Authorization` header, not an httpOnly cookie.** The client and server are cross-origin both locally and in production (separate domains for the S3/CloudFront frontend and the Lambda API), which would force `SameSite=None; Secure` — HTTPS everywhere, including local dev — just to make cookies work. The header approach avoids that entirely; the tradeoff is XSS-readability of the token, mitigated by a short 24h expiry rather than building refresh-token rotation.
