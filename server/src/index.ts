import { buildApp } from "./app.js";

const app = await buildApp();
const port = Number(process.env.PORT ?? 3001);

app.listen({ port }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
