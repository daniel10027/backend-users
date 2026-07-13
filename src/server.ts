import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`Serveur demarre sur le port ${env.port} (environnement : ${env.nodeEnv})`);
  console.log(`Documentation Swagger disponible sur http://localhost:${env.port}/api-docs`);
});
