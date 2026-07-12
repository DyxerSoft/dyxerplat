import { env } from "./config/env";
import { createServer } from "./server";

const app = createServer();

app.listen(env.API_PORT, () => {
  console.log(`API Dyxerplat escuchando en http://localhost:${env.API_PORT}`);
});
