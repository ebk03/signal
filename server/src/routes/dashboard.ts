import type { FastifyInstance } from "fastify";
import { runReadOnlyQuery } from "../db/readOnlyClient.js";

interface SkillCountRow {
  skill: string;
  count: string;
}

interface StatsRow {
  total_postings: string;
  last_scraped_at: string | null;
}

// Public, unauthenticated by design — the dashboard is the first thing a
// logged-out visitor sees. Do not add an `authenticate` preHandler here.
export async function registerDashboardRoutes(app: FastifyInstance) {
  app.get("/api/dashboard/skills", async () => {
    const [skillRows, statsRows] = await Promise.all([
      runReadOnlyQuery(
        `SELECT unnest(skills) AS skill, count(*) AS count
         FROM job_postings
         GROUP BY skill
         ORDER BY count DESC
         LIMIT 15`,
      ),
      runReadOnlyQuery(
        `SELECT count(*) AS total_postings, max(scraped_at) AS last_scraped_at
         FROM job_postings`,
      ),
    ]);

    const stats = statsRows[0] as unknown as StatsRow;
    const skills = skillRows as unknown as SkillCountRow[];

    return {
      totalPostings: Number(stats.total_postings),
      lastScrapedAt: stats.last_scraped_at,
      skills: skills.map((row) => ({ label: row.skill, value: Number(row.count) })),
    };
  });
}
