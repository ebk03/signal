import awsLambdaFastify from "@fastify/aws-lambda";
import { buildApp } from "./app.js";

// Built once per cold start, reused across warm invocations of the same
// execution environment — this is what keeps a warm Lambda fast despite
// Fastify's plugin-registration startup cost.
const app = await buildApp();

export const handler = awsLambdaFastify(app);
