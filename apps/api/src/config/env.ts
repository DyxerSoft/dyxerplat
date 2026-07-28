import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

const rootEnvPath = path.resolve(process.cwd(), "../../.env");
const localEnvPath = path.resolve(process.cwd(), ".env");

dotenv.config({
  path: fs.existsSync(rootEnvPath) ? rootEnvPath : localEnvPath
});

const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const defaultPublicUrl = vercelHost ? `https://${vercelHost}` : "http://localhost:4000";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  API_PORT: z.coerce.number().default(4000),
  API_BASE_URL: z.string().default(defaultPublicUrl),
  CORS_ORIGIN: z.string().default(vercelHost ? `https://${vercelHost}` : "http://localhost:3000"),
  JWT_SECRET: z.string().min(20),
  JWT_EXPIRES_IN: z.string().default("8h")
});

export const env = envSchema.parse(process.env);
