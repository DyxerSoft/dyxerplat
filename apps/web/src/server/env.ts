import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

const candidates = [
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), ".env.local")
];

for (const candidate of candidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
    break;
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(20),
  JWT_EXPIRES_IN: z.string().default("8h"),
  APP_URL: z.string().optional(),
  WEB_URL: z.string().optional(),
  VERCEL_URL: z.string().optional()
});

export const env = envSchema.parse(process.env);

export function getAppUrl() {
  if (env.APP_URL) {
    return env.APP_URL.replace(/\/$/, "");
  }

  if (env.WEB_URL) {
    return env.WEB_URL.replace(/\/$/, "");
  }

  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}
