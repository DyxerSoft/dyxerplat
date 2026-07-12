import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./common/middlewares/error-handler";
import { apiRoutes } from "./routes";

export function createServer() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("dev"));

  app.use("/api/v1", apiRoutes);
  app.use(errorHandler);

  return app;
}
