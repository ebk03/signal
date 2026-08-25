import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { registerAskRoute } from "./routes/ask.js";

const app = Fastify({ logger: true, trustProxy: true });

await app.register(cors, {
  origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
});

// global: false — rate limiting only applies to routes that opt in via
// their own `config: { rateLimit: {...} }`, so /health stays unthrottled.
await app.register(rateLimit, { global: false });

app.get("/health", async () => {
  return { status: "ok" };
});

await registerAskRoute(app);

const port = Number(process.env.PORT ?? 3001);

app.listen({ port }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
