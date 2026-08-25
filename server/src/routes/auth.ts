import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { hashPassword, verifyPassword } from "../auth/hash.js";
import { authenticate } from "../auth/authenticate.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validateCredentials(
  email: unknown,
  password: unknown,
): { email: string; password: string } | { error: string } {
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
    return { error: "A valid email is required." };
  }
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  return { email, password };
}

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post<{ Body: { email?: string; password?: string } }>(
    "/api/auth/signup",
    async (request, reply) => {
      const validated = validateCredentials(request.body?.email, request.body?.password);
      if ("error" in validated) {
        return reply.status(400).send({ error: validated.error });
      }
      const { email, password } = validated;

      const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing) {
        return reply.status(409).send({ error: "Email already registered." });
      }

      const passwordHash = await hashPassword(password);
      const [user] = await db
        .insert(users)
        .values({ email, passwordHash })
        .returning({ id: users.id, email: users.email });

      const token = app.jwt.sign({ sub: user.id, email: user.email }, { expiresIn: "24h" });
      return reply.status(201).send({ token, user });
    },
  );

  app.post<{ Body: { email?: string; password?: string } }>(
    "/api/auth/login",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    async (request, reply) => {
      const validated = validateCredentials(request.body?.email, request.body?.password);
      if ("error" in validated) {
        return reply.status(401).send({ error: "Invalid email or password." });
      }
      const { email, password } = validated;

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user || !(await verifyPassword(password, user.passwordHash))) {
        return reply.status(401).send({ error: "Invalid email or password." });
      }

      const token = app.jwt.sign({ sub: user.id, email: user.email }, { expiresIn: "24h" });
      return { token, user: { id: user.id, email: user.email } };
    },
  );

  app.get("/api/auth/me", { preHandler: authenticate }, async (request) => {
    return { user: { id: request.user.sub, email: request.user.email } };
  });
}
