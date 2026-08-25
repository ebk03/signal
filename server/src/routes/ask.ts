import type { FastifyInstance } from "fastify";
import { runAgent } from "../agent/agent.js";
import { authenticate, rateLimitKeyGenerator } from "../auth/authenticate.js";

export async function registerAskRoute(app: FastifyInstance) {
  app.post<{ Body: { question?: string } }>(
    "/api/ask",
    {
      preHandler: authenticate,
      config: {
        rateLimit: { max: 20, timeWindow: "15 minutes", keyGenerator: rateLimitKeyGenerator },
      },
    },
    async (request, reply) => {
      const question = request.body?.question;

      if (!question || typeof question !== "string" || !question.trim()) {
        return reply.status(400).send({ error: "question is required" });
      }

      try {
        const trace = await runAgent(question.trim());
        return { trace };
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: "Agent failed to answer the question." });
      }
    },
  );
}
