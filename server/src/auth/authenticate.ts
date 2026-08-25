import type { FastifyReply, FastifyRequest } from "fastify";
import type { JwtPayload } from "./types.js";
import "./types.js";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ error: "Unauthorized" });
  }
}

function extractBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

/**
 * Rate-limit key: authenticated user id when available, IP otherwise.
 * Verifies the JWT independently rather than reading request.user, since
 * Fastify doesn't guarantee relative ordering between two different
 * plugins' hooks in the same lifecycle phase — depending on the
 * `authenticate` preHandler having already run here would be fragile.
 */
export function rateLimitKeyGenerator(request: FastifyRequest): string {
  const token = extractBearerToken(request);
  if (!token) return `ip:${request.ip}`;

  try {
    const payload = request.server.jwt.verify<JwtPayload>(token);
    return `user:${payload.sub}`;
  } catch {
    return `ip:${request.ip}`;
  }
}
